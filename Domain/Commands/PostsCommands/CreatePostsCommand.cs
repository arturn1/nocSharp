using Domain.Commands.Contracts;
using Domain.Validation;

namespace Domain.Commands 
{

    public class CreatePostsCommand : ValidatableTypes, ICommand
    {
        public CreatePostsCommand(int id, string title, string body, int user_id, string status, DateTime created_at)
        {
            
            this.id = id;
            this.title = title;
            this.body = body;
            this.user_id = user_id;
            this.status = status;
            this.created_at = created_at;

        }
        public int id { get; set; }
        public string title { get; set; }
        public string body { get; set; }
        public int user_id { get; set; }
        public string status { get; set; }
        public DateTime created_at { get; set; }


        public bool IsCommandValid()
        {
            return this.isValid;
        }
    }
}