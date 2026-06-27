using AutoMapper;

using System.Collections.Generic;

using System.Linq;

using Investa.Application.DTOs.Requests;

using Investa.Application.Interfaces;

using Investa.Domain.Entities;

using Investa.Domain.Entities.Enums;

using Microsoft.EntityFrameworkCore;

using Microsoft.Extensions.Logging;



namespace Investa.Application.Services;



public class InvestmentRequestService : IInvestmentRequestService

{

    private readonly IUnitOfWork _unitOfWork;

    private readonly ICreditService _creditService;

    private readonly INotificationService _notificationService;

    private readonly IChatService _chatService;

    private readonly IMapper _mapper;

    private readonly ILogger<InvestmentRequestService> _logger;



    public InvestmentRequestService(

        IUnitOfWork unitOfWork, 

        ICreditService creditService, 

        INotificationService notificationService,

        IChatService chatService,

        IMapper mapper,

        ILogger<InvestmentRequestService> logger)

    {

        _unitOfWork = unitOfWork;

        _creditService = creditService;

        _notificationService = notificationService;

        _chatService = chatService;

        _mapper = mapper;

        _logger = logger;

    }



    public async Task<CreateInvestmentRequestResponseDto> CreateInvestmentRequestAsync(Guid investorId, CreateInvestmentRequestDto dto)

    {

        _logger.LogInformation("Creating investment request for investor {InvestorId}, investment {InvestmentId}, amount {Amount}, requestType={RequestType}",

            investorId, dto.InvestmentId, dto.Amount, dto.RequestType);



        // Validate RequestType using strongly typed enum + centralized codec (no scattered string comparisons)

        var requestType = InvestmentRequestTypeCodec.Parse(dto.RequestType);



        // RequestMetadata rules:

        // - ContactFounder: optional

        // - InvestmentInterest: required

        if (requestType == InvestmentRequestType.InvestmentInterest && string.IsNullOrWhiteSpace(dto.RequestMetadata))

        {

            throw new InvalidOperationException("RequestMetadata is required for InvestmentInterest.");

        }



        // Canonicalize persisted value for backward compatibility and consistent reads

        var persistedRequestType = InvestmentRequestTypeCodec.ToPersistedString(requestType);



        var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(dto.InvestmentId);

        if (investment == null)

        {

            throw new InvalidOperationException("Investment not found");

        }



        var client = (await _unitOfWork.Repository<Client>().FindAsync(c => c.UserId == investorId)).FirstOrDefault();

        var user = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(investorId);

        if (client == null && user == null)

        {

            throw new InvalidOperationException("Investor account not found");

        }



        // Check for existing pending request for same investor and investment

        var existingRequest = (await _unitOfWork.Repository<InvestmentRequest>()

            .FindAsync(r => r.InvestmentId == dto.InvestmentId 

                        && r.InvestorId == investorId 

                        && r.Status == InvestmentRequestStatus.Pending))

            .FirstOrDefault();



        if (existingRequest != null)

        {

            _logger.LogWarning("Investor {InvestorId} already has a pending request for investment {InvestmentId}", investorId, dto.InvestmentId);

            throw new InvalidOperationException("You already have a pending request for this investment");

        }



        var availableCredit = client?.Credit ?? user?.WalletBalance ?? 0m;

        if (availableCredit < dto.Amount)

        {

            throw new InvalidOperationException("Insufficient credits");

        }



        var investmentName = investment.BusinessName ?? "Investment";

        var descriptionEn = $"Investment request for {investmentName}";



        // Deduct credits and create audit trail transaction

        try

        {

            _logger.LogInformation("Deducting {Amount} credits from investor {InvestorId}", dto.Amount, investorId);

            await _creditService.CreateTransactionAsync(investorId, -dto.Amount, "debit", descriptionEn);

            _logger.LogInformation("Credits deducted successfully for investor {InvestorId}", investorId);

        }

        catch (Exception ex)

        {

            _logger.LogError(ex, "Failed to deduct credits for investor {InvestorId}", investorId);

            throw new InvalidOperationException($"Failed to process payment: {ex.Message}", ex);

        }



        // Create a single investment request record (sender -> receiver)

        var request = new InvestmentRequest

        {

            InvestmentId = investment.Id,

            InvestorId = investorId, // sender

            FounderId = investment.FounderId, // receiver

            Amount = dto.Amount,

            Shares = dto.Shares,

            Status = InvestmentRequestStatus.Pending,

            Direction = InvestmentRequestDirection.Outgoing, // keep for compatibility

            RequestType = persistedRequestType,

            RequestMetadata = dto.RequestMetadata,

            CreatedAt = DateTime.UtcNow

        };



        await _unitOfWork.Repository<InvestmentRequest>().AddAsync(request);

        

        try

        {

            _logger.LogInformation("Saving investment request to database");

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Investment request saved successfully - id: {RequestId}", request.Id);

        }

        catch (DbUpdateException ex)

        {

            var innerMessage = ex.InnerException?.Message ?? "No inner exception details.";

            _logger.LogError(ex, "Failed to save investment requests to database for investor {InvestorId}. Inner: {Inner}", investorId, innerMessage);

            throw new InvalidOperationException($"Failed to create investment request: {innerMessage}", ex);

        }

        catch (Exception ex)

        {

            _logger.LogError(ex, "Failed to save investment requests to database for investor {InvestorId}", investorId);

            throw new InvalidOperationException($"Failed to create investment request: {ex.Message}", ex);

        }



        // Send push notification to founder (best-effort, don't fail if notification fails)

        try

        {

            var firstName = client?.FirstName ?? user?.Profile?.FirstName ?? string.Empty;

            var lastName = client?.LastName ?? user?.Profile?.LastName ?? string.Empty;

            var investorName = $"{firstName} {lastName}".Trim();

            if (string.IsNullOrWhiteSpace(investorName) && user != null)

            {

                investorName = user.Profile?.FullName ?? user.Name;

            }

            if (string.IsNullOrWhiteSpace(investorName)) investorName = "Investor";



            _logger.LogInformation("Sending notification to founder {FounderId} about investment request from {InvestorName}", 

                investment.FounderId, investorName);



            await _notificationService.SendNotificationAsync(

                investment.FounderId.ToString(),

                "New Investment Request",

                $"{investorName} wants to invest {dto.Amount:N0} EGP in {investmentName}",

                new Dictionary<string, string>

                {

                    ["requestId"] = request.Id.ToString(),

                    ["investmentId"] = investment.Id.ToString(),

                    ["investorId"] = investorId.ToString(),

                    ["amount"] = dto.Amount.ToString("0.##"),

                    ["shares"] = dto.Shares?.ToString() ?? "0",

                    ["investmentName"] = investmentName,

                    ["investorName"] = investorName,

                    ["type"] = persistedRequestType,

                    ["action"] = "new_request"

                });

            

            _logger.LogInformation("Notification sent successfully to founder {FounderId} for request {RequestId}", investment.FounderId, request.Id);

        }

        catch (Exception ex)

        {

            // Silently fail notification - this is non-critical

            _logger.LogWarning(ex, "Failed to send notification to founder {FounderId} (non-critical)", investment.FounderId);

        }



        var updatedClient = (await _unitOfWork.Repository<Client>().FindAsync(c => c.UserId == investorId)).FirstOrDefault();

        var updatedUser = await _unitOfWork.Repository<AuthUser>().GetByIdAsync(investorId);

        var updatedBalance = updatedClient?.Credit ?? updatedUser?.WalletBalance ?? 0m;



        try

        {

            var mapped = _mapper.Map<InvestmentRequestDto>(request);



            // Populate display fields using related entities

            try

            {

                var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

                mapped.InvestmentTitle = inv?.BusinessName;

                mapped.InvestmentDescription = inv?.Description;

                mapped.BusinessName = inv?.BusinessName;

            }

            catch

            {

                // ignore failures to fetch investment details

            }



            try

            {

                var founder = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.FounderId, u => u.Profile);

                mapped.FounderDisplayName = founder?.Profile?.FullName ?? founder?.Name;

                mapped.FounderCredibilityScore = founder?.Profile?.CurrentCredibilityScore;

                mapped.FounderTrustLevel = GetTrustLevelFromVerificationStatus(founder?.Profile?.VerificationStatus);

            }

            catch

            {

                // ignore failures to fetch founder details

            }



            try

            {

                var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

                mapped.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

                mapped.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

                mapped.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

            }

            catch

            {

                // ignore failures to fetch investor details

            }



            var response = new CreateInvestmentRequestResponseDto

            {

                Request = mapped,

                OutgoingRequest = mapped, // backward compatibility

                IncomingRequest = mapped,

                UpdatedCreditBalance = updatedBalance

            };



            _logger.LogInformation("Investment request created successfully for investor {InvestorId}: updatedBalance={UpdatedBalance}", 

                investorId, updatedBalance);

            

            return response;

        }

        catch (Exception ex)

        {

            _logger.LogError(ex, "Failed to map response DTOs for investment request");

            throw new InvalidOperationException($"Failed to prepare response: {ex.Message}", ex);

        }

    }



    public async Task<GetMyRequestsResponseDto> GetMyRequestsAsync(Guid userId)

    {

        // Fetch incoming requests (user is the receiver/founder)

        var incomingRequests = await _unitOfWork.Repository<InvestmentRequest>()

            .FindAsync(r => r.FounderId == userId);



        var incoming = new List<InvestmentRequestDto>();

        foreach (var request in incomingRequests)

        {

            var dto = _mapper.Map<InvestmentRequestDto>(request);



            try

            {

                var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

                dto.InvestmentTitle = inv?.BusinessName;

                dto.InvestmentDescription = inv?.Description;

                dto.BusinessName = inv?.BusinessName;

            }

            catch { }



            try

            {

                var founder = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.FounderId, u => u.Profile);

                dto.FounderDisplayName = founder?.Profile?.FullName ?? founder?.Name;

                dto.FounderCredibilityScore = founder?.Profile?.CurrentCredibilityScore;

                dto.FounderTrustLevel = GetTrustLevelFromVerificationStatus(founder?.Profile?.VerificationStatus);

            }

            catch { }



            try

            {

                var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

                dto.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

                dto.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

                dto.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

            }

            catch { }



            incoming.Add(dto);

        }



        // Fetch outgoing requests (user is the sender/investor)

        var outgoingRequests = await _unitOfWork.Repository<InvestmentRequest>()

            .FindAsync(r => r.InvestorId == userId);



        var outgoing = new List<InvestmentRequestDto>();

        foreach (var request in outgoingRequests)

        {

            var dto = _mapper.Map<InvestmentRequestDto>(request);



            try

            {

                var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

                dto.InvestmentTitle = inv?.BusinessName;

                dto.InvestmentDescription = inv?.Description;

                dto.BusinessName = inv?.BusinessName;

            }

            catch { }



            try

            {

                var founder = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.FounderId, u => u.Profile);

                dto.FounderDisplayName = founder?.Profile?.FullName ?? founder?.Name;

                dto.FounderCredibilityScore = founder?.Profile?.CurrentCredibilityScore;

                dto.FounderTrustLevel = GetTrustLevelFromVerificationStatus(founder?.Profile?.VerificationStatus);

            }

            catch { }



            try

            {

                var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

                dto.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

                dto.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

                dto.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

            }

            catch { }



            outgoing.Add(dto);

        }



        return new GetMyRequestsResponseDto

        {

            Incoming = incoming,

            Outgoing = outgoing

        };

    }



    public async Task<InvestmentRequestDto> ApproveInvestmentRequestAsync(int requestId, Guid founderId)

    {

        _logger.LogInformation("Approving investment request {RequestId} by founder {FounderId}", requestId, founderId);



        var request = await _unitOfWork.Repository<InvestmentRequest>().GetByIdAsync(requestId);

        if (request == null)

        {

            throw new InvalidOperationException("Investment request not found");

        }



        // Verify the requester is the founder

        if (request.FounderId != founderId)

        {

            throw new UnauthorizedAccessException("Only the founder can approve investment requests");

        }



        if (request.Status != InvestmentRequestStatus.Pending)

        {

            throw new InvalidOperationException("Only pending requests can be approved");

        }



        // Update request status

        request.Status = InvestmentRequestStatus.Accepted;

        request.UpdatedAt = DateTime.UtcNow;



        await _unitOfWork.SaveChangesAsync();



        // Create or update InvestmentParticipant record

        var existingParticipant = (await _unitOfWork.Repository<InvestmentParticipant>()

            .FindAsync(p => p.InvestmentId == request.InvestmentId && p.InvestorId == request.InvestorId))

            .FirstOrDefault();



        if (existingParticipant == null)

        {

            var participant = new InvestmentParticipant

            {

                InvestmentId = request.InvestmentId,

                InvestorId = request.InvestorId,

                SharesPurchased = request.Shares ?? 0,

                AmountInvested = request.Amount,

                InvestmentDate = DateTime.UtcNow,

                Status = ParticipationLifecycle.Approved,

                CreatedAt = DateTime.UtcNow

            };

            await _unitOfWork.Repository<InvestmentParticipant>().AddAsync(participant);

        }

        else

        {

            existingParticipant.Status = ParticipationLifecycle.Approved;

            existingParticipant.SharesPurchased = request.Shares ?? existingParticipant.SharesPurchased;

            existingParticipant.AmountInvested = request.Amount;

        }



        await _unitOfWork.SaveChangesAsync();



        // Create chat between founder and investor

        try

        {

            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            var investmentName = investment?.BusinessName ?? "Investment";

            

            var conversation = await _chatService.CreateConversationAsync(

                request.FounderId,

                request.InvestorId,

                $"Investment: {investmentName}"

            );

            

            _logger.LogInformation("Chat {ConversationId} created for approved request {RequestId}", conversation.Id, requestId);

        }

        catch (Exception ex)

        {

            _logger.LogWarning(ex, "Failed to create chat for approved request {RequestId}", requestId);

            // Don't fail the approval if chat creation fails

        }



        // Send notification to investor

        try

        {

            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            var investmentName = investment?.BusinessName ?? "Investment";

            

            await _notificationService.SendNotificationAsync(

                request.InvestorId.ToString(),

                "Investment Request Approved",

                $"Your investment request for {investmentName} has been approved",

                new Dictionary<string, string>

                {

                    ["requestId"] = request.Id.ToString(),

                    ["investmentId"] = request.InvestmentId.ToString(),

                    ["type"] = InvestmentRequestTypeCodec.ToPersistedString(InvestmentRequestTypeCodec.Parse(request.RequestType)),

                    ["action"] = "approved"

                });

        }

        catch (Exception ex)

        {

            _logger.LogWarning(ex, "Failed to send approval notification to investor {InvestorId}", request.InvestorId);

        }



        var dto = _mapper.Map<InvestmentRequestDto>(request);



        // Populate display fields

        try

        {

            var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            dto.InvestmentTitle = inv?.BusinessName;

            dto.BusinessName = inv?.BusinessName;

        }

        catch { /* ignore */ }



        try

        {

            var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

            dto.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

            dto.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

            dto.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

        }

        catch { /* ignore */ }



        _logger.LogInformation("Investment request {RequestId} approved successfully", requestId);

        return dto;

    }



    public async Task<InvestmentRequestDto> RejectInvestmentRequestAsync(int requestId, Guid founderId)

    {

        _logger.LogInformation("Rejecting investment request {RequestId} by founder {FounderId}", requestId, founderId);



        var request = await _unitOfWork.Repository<InvestmentRequest>().GetByIdAsync(requestId);

        if (request == null)

        {

            throw new InvalidOperationException("Investment request not found");

        }



        // Verify the requester is the founder

        if (request.FounderId != founderId)

        {

            throw new UnauthorizedAccessException("Only the founder can reject investment requests");

        }



        if (request.Status != InvestmentRequestStatus.Pending)

        {

            throw new InvalidOperationException("Only pending requests can be rejected");

        }



        // Update request status

        request.Status = InvestmentRequestStatus.Declined;

        request.UpdatedAt = DateTime.UtcNow;



        await _unitOfWork.SaveChangesAsync();



        // Refund credits to investor

        try

        {

            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            var investmentName = investment?.BusinessName ?? "Investment";

            var descriptionEn = $"Refund for rejected investment request: {investmentName}";



            await _creditService.CreateTransactionAsync(request.InvestorId, request.Amount, "credit", descriptionEn);

            _logger.LogInformation("Refunded {Amount} credits to investor {InvestorId}", request.Amount, request.InvestorId);

        }

        catch (Exception ex)

        {

            _logger.LogError(ex, "Failed to refund credits to investor {InvestorId}", request.InvestorId);

        }



        // Update InvestmentParticipant status if exists

        var existingParticipant = (await _unitOfWork.Repository<InvestmentParticipant>()

            .FindAsync(p => p.InvestmentId == request.InvestmentId && p.InvestorId == request.InvestorId))

            .FirstOrDefault();



        if (existingParticipant != null)

        {

            existingParticipant.Status = ParticipationLifecycle.Rejected;

            await _unitOfWork.SaveChangesAsync();

        }



        // Send notification to investor

        try

        {

            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            var investmentName = investment?.BusinessName ?? "Investment";

            

            await _notificationService.SendNotificationAsync(

                request.InvestorId.ToString(),

                "Investment Request Rejected",

                $"Your investment request for {investmentName} has been rejected",

                new Dictionary<string, string>

                {

                    ["requestId"] = request.Id.ToString(),

                    ["investmentId"] = request.InvestmentId.ToString(),

                    ["type"] = InvestmentRequestTypeCodec.ToPersistedString(InvestmentRequestTypeCodec.Parse(request.RequestType)),

                    ["action"] = "rejected"

                });

        }

        catch (Exception ex)

        {

            _logger.LogWarning(ex, "Failed to send rejection notification to investor {InvestorId}", request.InvestorId);

        }



        var dto = _mapper.Map<InvestmentRequestDto>(request);



        // Populate display fields

        try

        {

            var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            dto.InvestmentTitle = inv?.BusinessName;

            dto.BusinessName = inv?.BusinessName;

        }

        catch { /* ignore */ }



        try

        {

            var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

            dto.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

            dto.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

            dto.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

        }

        catch { /* ignore */ }



        _logger.LogInformation("Investment request {RequestId} rejected successfully", requestId);

        return dto;

    }



    public async Task<InvestmentRequestDto> WithdrawInvestmentRequestAsync(int requestId, Guid investorId)

    {

        _logger.LogInformation("Withdrawing investment request {RequestId} by investor {InvestorId}", requestId, investorId);



        var request = await _unitOfWork.Repository<InvestmentRequest>().GetByIdAsync(requestId);

        if (request == null)

        {

            throw new InvalidOperationException("Investment request not found");

        }



        if (request.InvestorId != investorId)

        {

            throw new UnauthorizedAccessException("Only the investor can withdraw investment requests");

        }



        if (request.Status != InvestmentRequestStatus.Pending)

        {

            throw new InvalidOperationException("Only pending requests can be withdrawn");

        }



        // Update request status

        request.Status = InvestmentRequestStatus.Withdrawn;

        request.UpdatedAt = DateTime.UtcNow;



        await _unitOfWork.SaveChangesAsync();



        // Refund credits to investor

        try

        {

            var investment = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            var investmentName = investment?.BusinessName ?? "Investment";

            var descriptionEn = $"Refund for withdrawn investment request: {investmentName}";



            await _creditService.CreateTransactionAsync(request.InvestorId, request.Amount, "credit", descriptionEn);

            _logger.LogInformation("Refunded {Amount} credits to investor {InvestorId}", request.Amount, request.InvestorId);

        }

        catch (Exception ex)

        {

            _logger.LogError(ex, "Failed to refund credits to investor {InvestorId}", request.InvestorId);

        }



        var dto = _mapper.Map<InvestmentRequestDto>(request);



        // Populate display fields

        try

        {

            var inv = await _unitOfWork.Repository<Investment>().GetByIdAsync(request.InvestmentId);

            dto.InvestmentTitle = inv?.BusinessName;

            dto.InvestmentDescription = inv?.Description;

            dto.BusinessName = inv?.BusinessName;

        }

        catch

        {

            // ignore failures

        }



        try

        {

            var founder = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.FounderId, u => u.Profile);

            dto.FounderDisplayName = founder?.Profile?.FullName ?? founder?.Name;

            dto.FounderCredibilityScore = founder?.Profile?.CurrentCredibilityScore;

            dto.FounderTrustLevel = GetTrustLevelFromVerificationStatus(founder?.Profile?.VerificationStatus);

        }

        catch

        {

            // ignore failures

        }



        try

        {

            var investor = await _unitOfWork.Repository<AuthUser>().GetSingleAsync(u => u.Id == request.InvestorId, u => u.Profile);

            dto.InvestorDisplayName = investor?.Profile?.FullName ?? investor?.Name;

            dto.InvestorCredibilityScore = investor?.Profile?.CurrentCredibilityScore;

            dto.InvestorTrustLevel = GetTrustLevelFromVerificationStatus(investor?.Profile?.VerificationStatus);

        }

        catch

        {

            // ignore failures

        }



        _logger.LogInformation("Investment request {RequestId} withdrawn successfully", requestId);

        return dto;

    }



    private string? GetTrustLevelFromVerificationStatus(VerificationStatus? status)

    {

        if (!status.HasValue) return "Basic";

        return status switch

        {

            VerificationStatus.None => "Basic",

            VerificationStatus.Pending => "Medium",

            VerificationStatus.Verified => "High",

            _ => "Basic"

        };

    }

}

