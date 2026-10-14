using System.Security.Claims;
using Investa.Application.Common;
using Investa.Application.DTOs;
using Investa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace Investa.API.Controllers;
[Authorize,Route("api/v1/projects/{projectId:int}/room")]
public sealed class ProjectRoomsController(IProjectRoomService rooms):BaseApiController
{
    [HttpGet]public async Task<IActionResult>Get(int projectId,CancellationToken t){var a=Actor();if(a==null)return ErrorResponse("Unable to resolve authenticated user",401);
        try{return SuccessResponse(await rooms.GetAsync(a.Value,projectId,User.IsInRole("Admin")||User.IsInRole("Reviewer"),t));}catch(BusinessValidationException e){return Err(e);}}
    [HttpPost("entries")]public async Task<IActionResult>AddEntry(int projectId,[FromBody]CreateProjectRoomEntryRequest r,CancellationToken t){var a=Actor();if(a==null)return ErrorResponse("Unable to resolve authenticated user",401);
        try{return SuccessResponse(await rooms.AddEntryAsync(a.Value,projectId,r,t),"Project Room entry created",201);}catch(BusinessValidationException e){return Err(e);}}
    [HttpPost("milestones/{entryId:long}/complete")]public async Task<IActionResult>Complete(int projectId,long entryId,CancellationToken t){var a=Actor();if(a==null)return ErrorResponse("Unable to resolve authenticated user",401);
        try{return SuccessResponse(await rooms.CompleteMilestoneAsync(a.Value,projectId,entryId,t));}catch(BusinessValidationException e){return Err(e);}}
    [HttpPost("documents")]public async Task<IActionResult>AddDocument(int projectId,[FromBody]CreateProjectRoomDocumentRequest r,CancellationToken t){var a=Actor();if(a==null)return ErrorResponse("Unable to resolve authenticated user",401);
        try{return SuccessResponse(await rooms.AddDocumentAsync(a.Value,projectId,r,t),"Project document added",201);}catch(BusinessValidationException e){return Err(e);}}
    [HttpGet("documents/{documentId:long}/download")]public async Task<IActionResult>DownloadDocument(int projectId,long documentId,CancellationToken t)=>await GetDocument(projectId,documentId,false,t);
    [HttpGet("documents/{documentId:long}/preview")]public async Task<IActionResult>PreviewDocument(int projectId,long documentId,CancellationToken t)=>await GetDocument(projectId,documentId,true,t);
    private async Task<IActionResult>GetDocument(int projectId,long documentId,bool inline,CancellationToken t){var a=Actor();if(a==null)return ErrorResponse("Unable to resolve authenticated user",401);
        try{var file=await rooms.DownloadDocumentAsync(a.Value,projectId,documentId,User.IsInRole("Admin")||User.IsInRole("Reviewer"),t);
            if(inline&&file.MimeType is not ("application/pdf" or "text/plain" or "text/csv" or "image/jpeg" or "image/png" or "image/webp" or "image/gif"))
                return ErrorResponse("Preview is not supported for this document type",415);
            return inline?File(file.Content,file.MimeType):File(file.Content,file.MimeType,file.FileName,enableRangeProcessing:true);
        }catch(BusinessValidationException e){return Err(e);}}
    private Guid?Actor(){var v=User.FindFirst("sub")?.Value??User.FindFirst("id")?.Value??User.FindFirst(ClaimTypes.NameIdentifier)?.Value;return Guid.TryParse(v,out var id)?id:null;}
    private IActionResult Err(BusinessValidationException e)=>ErrorResponse(e.Message,e.Code is "PROJECT_NOT_FOUND" or "PROJECT_DOCUMENT_NOT_FOUND" or "PROJECT_DOCUMENT_FILE_NOT_FOUND"?404:e.Code=="PROJECT_ROOM_FORBIDDEN"?403:400);
}
