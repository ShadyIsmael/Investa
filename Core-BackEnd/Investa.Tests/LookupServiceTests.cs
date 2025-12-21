using Moq;
using Investa.Application.Services;
using Investa.Application.Interfaces;
using Investa.Domain.Entities;
using Investa.Application.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;
using Xunit;

namespace Investa.Tests;

public class LookupServiceTests
{
    [Fact]
    public async Task GetAllAsync_ReturnsOrderedLookups()
    {
        var mockUow = new Mock<IUnitOfWork>();
        var repoMock = new Mock<IRepository<Lookup>>();
        var mockLocalizer = new Mock<Microsoft.Extensions.Localization.IStringLocalizer<Investa.API.Resources.SharedResource>>();

        // default localizer behavior: return ResourceNotFound true so service falls back to Value
        mockLocalizer.Setup(l => l[It.IsAny<string>()])
            .Returns((string name) => new Microsoft.Extensions.Localization.LocalizedString(name, string.Empty, resourceNotFound: true));

        var data = new List<Lookup>
        {
            new Lookup { Id = 2, Key = "B", Value = "B", SortOrder = 2 },
            new Lookup { Id = 1, Key = "A", Value = "A", SortOrder = 1 }
        };

        repoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(data as IEnumerable<Lookup>);
        mockUow.Setup(u => u.Repository<Lookup>()).Returns(repoMock.Object);

        var service = new LookupService(mockUow.Object, mockLocalizer.Object);
        var res = await service.GetAllAsync();

        Assert.Collection(res,
            item => Assert.Equal(1, item.Id),
            item => Assert.Equal(2, item.Id)
        );
    }
}
