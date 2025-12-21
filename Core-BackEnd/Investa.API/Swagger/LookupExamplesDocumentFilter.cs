using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Investa.API.Swagger;

public class LookupExamplesDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var path = "/api/v1/lookups/grouped";
        if (swaggerDoc.Paths.ContainsKey(path))
        {
            var resp = new OpenApiObject
            {
                ["status"] = new OpenApiBoolean(true),
                ["message"] = new OpenApiString("OK"),
                ["data"] = new OpenApiObject
                {
                    ["BusinessStage"] = new OpenApiArray
                    {
                        new OpenApiObject { ["id"] = new OpenApiInteger(1), ["key"] = new OpenApiString("Initiation"), ["value"] = new OpenApiString("Initiation"), ["slug"] = new OpenApiString("initiation") },
                        new OpenApiObject { ["id"] = new OpenApiInteger(2), ["key"] = new OpenApiString("Planning"), ["value"] = new OpenApiString("Planning"), ["slug"] = new OpenApiString("planning") }
                    },
                    ["BusinessCategory"] = new OpenApiArray
                    {
                        new OpenApiObject { ["id"] = new OpenApiInteger(100), ["key"] = new OpenApiString("Technology"), ["value"] = new OpenApiString("Technology"), ["slug"] = new OpenApiString("technology") }
                    }
                }
            };

            var pathItem = swaggerDoc.Paths[path];
            foreach (var op in pathItem.Operations.Values)
            {
                if (op.Responses.TryGetValue("200", out var response))
                {
                    response.Content ??= new Dictionary<string, OpenApiMediaType>();
                    response.Content["application/json"] = new OpenApiMediaType { Example = resp };
                }
            }
        }
    }
}
