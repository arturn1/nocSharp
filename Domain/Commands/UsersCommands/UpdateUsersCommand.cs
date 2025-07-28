using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class UpdateUsersCommand : ValidatableTypes, ICommand
    {
        public UpdateUsersCommand(Guid id, int id, string username, string role, DateTime created_at)
        {
            this.Id = id;
            this.id = id;
            this.username = username;
            this.role = role;
            this.created_at = created_at;

        }

        public Guid Id { get; set; }
        public int id { get; set; }
        public string username { get; set; }
        public string role { get; set; }
        public DateTime created_at { get; set; }


        public bool IsCommandValid()
        {
            ValidateGuidNotEmpty(Id, "Id");
            
            return this.isValid;
        }
    }
}