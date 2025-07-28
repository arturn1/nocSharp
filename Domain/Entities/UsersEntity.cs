using System;

namespace Domain.Entities
{
    
    public class UsersEntity : BaseEntity 
    {
        public UsersEntity() 
        {
        }
        
        public UsersEntity(int id, string username, string role, DateTime created_at)
        {
            this.id = id;
            this.username = username;
            this.role = role;
            this.created_at = created_at;

        }
        
        public int id { get; set; }
        public string username { get; set; }
        public string role { get; set; }
        public DateTime created_at { get; set; }

    }
}