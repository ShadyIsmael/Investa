using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Domain.Entities.Enums;
namespace Investa.Application.Services;
public static class LoanCashFlowCalculator
{
 public static ParticipationPaymentScheduleDto Calculate(int requestId,int opportunityId,string title,string? currency,decimal principal,decimal annualRatePercent,int durationMonths,string frequency,DateTime startDate,DateTime finalDate)
 {
  var canonicalFrequency = RepaymentModelCatalog.NormalizeOrThrow(frequency);
  var interval=canonicalFrequency switch { RepaymentModelCatalog.Monthly=>1,RepaymentModelCatalog.Quarterly=>3,RepaymentModelCatalog.SemiAnnual=>6,RepaymentModelCatalog.Annual=>12,_=>throw new InvalidOperationException("Unsupported canonical repayment model.")};
  var count=Math.Max(1,(int)Math.Ceiling(durationMonths/(decimal)interval)); var total=Money(principal*(annualRatePercent/100m)*(durationMonths/12m)); var eachInterest=Money(total/count); var items=new List<ExpectedPaymentScheduleItemDto>(count); decimal usedInterest=0; var today=DateTime.UtcNow.Date;
  for(var i=1;i<=count;i++){var last=i==count;var interest=last?total-usedInterest:eachInterest;var principalPart=last?principal:0m;var due=last?finalDate.Date:startDate.Date.AddMonths(interval*i);usedInterest+=interest;items.Add(new(){InstallmentNumber=i,DueDate=due,ExpectedInterest=interest,ExpectedPrincipal=principalPart,ExpectedTotal=interest+principalPart,RemainingAmount=interest+principalPart,ActualPaid=null,Status=due<=today?ExpectedPaymentStatus.Due:ExpectedPaymentStatus.Upcoming});}
  return new(){ParticipationRequestId=requestId,OpportunityId=opportunityId,OpportunityTitle=title,Currency=currency,Principal=principal,AnnualInterestRate=annualRatePercent,DurationMonths=durationMonths,RepaymentFrequency=canonicalFrequency,PrincipalRepaymentMethod=LoanPrincipalRepaymentMethod.AtMaturity,StartDate=startDate,FinalRepaymentDate=finalDate,TotalExpectedInterest=total,AverageExpectedMonthlyIncome=Money(total/durationMonths),ReceivedToDate=null,RemainingPrincipal=null,Payments=items};
 }
 private static decimal Money(decimal value)=>Math.Round(value,2,MidpointRounding.AwayFromZero);
}
