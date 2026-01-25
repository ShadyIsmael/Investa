using Microsoft.AspNetCore.Identity;

class Program
{
    static int Main(string[] args)
    {
        var password = args.Length > 0 ? args[0] : "P@ssw0rd";
        var hasher = new PasswordHasher<IdentityUser>();
        var user = new IdentityUser();
        var hash = hasher.HashPassword(user, password);
        System.Console.WriteLine(hash);
        return 0;
    }
}
