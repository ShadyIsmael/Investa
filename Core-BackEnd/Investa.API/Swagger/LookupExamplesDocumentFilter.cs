using System.Text.Json.Nodes;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Investa.API.Swagger;

public sealed class LookupExamplesDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        const string path = "/api/v1/lookups/grouped";
        if (!swaggerDoc.Paths.TryGetValue(path, out var pathItem)) return;

        JsonNode example = JsonNode.Parse("""
        {"status":true,"message":"OK","data":{"BusinessStage":[{"id":1,"key":"Initiation","value":"Initiation","slug":"initiation"},{"id":2,"key":"Planning","value":"Planning","slug":"planning"}],"BusinessCategory":[{"id":100,"key":"Technology","value":"Technology","slug":"technology"}]}}
        """)!;

        foreach (var operation in pathItem.Operations.Values)
        {
            if (operation.Responses.TryGetValue("200", out var response))
            {
                response.Content["application/json"] = new OpenApiMediaType { Example = example.DeepClone() };
            }
        }
    }
}
