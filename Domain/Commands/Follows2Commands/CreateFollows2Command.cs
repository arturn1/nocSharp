using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreateFollows2Command : ValidatableTypes, ICommand
    {
        public CreateFollows2Command(int following_user_id, int followed_user_id, DateTime created_at)
        {
            
            this.following_user_id = following_user_id;
            this.followed_user_id = followed_user_id;
            this.created_at = created_at;

        }
        public int following_user_id { get; set; }
        public int followed_user_id { get; set; }
        public DateTime created_at { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}