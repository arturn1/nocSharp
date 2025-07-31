import { Entity } from '../models/Entity';

export interface EntityTemplate {
  id: string;
  name: string;
  description: string;
  entities: Entity[];
  tags: string[];
  category: string;
  icon: string;
}

export class TemplateService {
  private static templates: EntityTemplate[] = [
    {
      id: '1',
      name: 'E-commerce Basic',
      description: 'Basic entities for an e-commerce system with users, products, and orders',
      category: 'E-commerce',
      icon: 'ShoppingCartOutlined',
      entities: [
        {
          name: 'User',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'Password', type: 'string', collectionType: 'none' },
            { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Product',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'Price', type: 'decimal', collectionType: 'none' },
            { name: 'Stock', type: 'int', collectionType: 'none' }
          ]
        },
        {
          name: 'Order',
          properties: [
            { name: 'UserId', type: 'int', collectionType: 'none' },
            { name: 'Total', type: 'decimal', collectionType: 'none' },
            { name: 'Status', type: 'string', collectionType: 'none' },
            { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['e-commerce', 'basic', 'web']
    },
    {
      id: '2',
      name: 'Blog System',
      description: 'Complete blog system with authors, posts, comments, and categories',
      category: 'Content Management',
      icon: 'EditOutlined',
      entities: [
        {
          name: 'Author',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'Bio', type: 'string', collectionType: 'none' },
            { name: 'AvatarUrl', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Post',
          properties: [
            { name: 'Title', type: 'string', collectionType: 'none' },
            { name: 'Content', type: 'string', collectionType: 'none' },
            { name: 'AuthorId', type: 'int', collectionType: 'none' },
            { name: 'PublishedAt', type: 'DateTime', collectionType: 'none' },
            { name: 'Tags', type: 'string', collectionType: 'List' }
          ]
        },
        {
          name: 'Comment',
          properties: [
            { name: 'Content', type: 'string', collectionType: 'none' },
            { name: 'PostId', type: 'int', collectionType: 'none' },
            { name: 'AuthorName', type: 'string', collectionType: 'none' },
            { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['blog', 'cms', 'content']
    },
    {
      id: '3',
      name: 'Financial Management',
      description: 'Financial system with accounts, transactions, and budgets',
      category: 'Finance',
      icon: 'DollarOutlined',
      entities: [
        {
          name: 'Account',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'AccountNumber', type: 'string', collectionType: 'none' },
            { name: 'Balance', type: 'decimal', collectionType: 'none' },
            { name: 'AccountType', type: 'string', collectionType: 'none' },
            { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Transaction',
          properties: [
            { name: 'Amount', type: 'decimal', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'AccountId', type: 'int', collectionType: 'none' },
            { name: 'CategoryId', type: 'int', collectionType: 'none' },
            { name: 'TransactionDate', type: 'DateTime', collectionType: 'none' },
            { name: 'Type', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Category',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'Color', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Budget',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Amount', type: 'decimal', collectionType: 'none' },
            { name: 'CategoryId', type: 'int', collectionType: 'none' },
            { name: 'StartDate', type: 'DateTime', collectionType: 'none' },
            { name: 'EndDate', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['finance', 'accounting', 'budget']
    },
    {
      id: '4',
      name: 'Task Management',
      description: 'Project and task management system with teams and assignments',
      category: 'Project Management',
      icon: 'ProjectOutlined',
      entities: [
        {
          name: 'Project',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'StartDate', type: 'DateTime', collectionType: 'none' },
            { name: 'EndDate', type: 'DateTime', collectionType: 'none' },
            { name: 'Status', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Task',
          properties: [
            { name: 'Title', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'ProjectId', type: 'int', collectionType: 'none' },
            { name: 'AssignedToId', type: 'int', collectionType: 'none' },
            { name: 'Priority', type: 'string', collectionType: 'none' },
            { name: 'Status', type: 'string', collectionType: 'none' },
            { name: 'DueDate', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Team',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'LeaderId', type: 'int', collectionType: 'none' }
          ]
        },
        {
          name: 'Member',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'Role', type: 'string', collectionType: 'none' },
            { name: 'TeamId', type: 'int', collectionType: 'none' }
          ]
        }
      ],
      tags: ['project', 'task', 'team', 'management']
    },
    {
      id: '5',
      name: 'Learning Management',
      description: 'Educational platform with courses, students, and assessments',
      category: 'Education',
      icon: 'BookOutlined',
      entities: [
        {
          name: 'Course',
          properties: [
            { name: 'Title', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'InstructorId', type: 'int', collectionType: 'none' },
            { name: 'Duration', type: 'int', collectionType: 'none' },
            { name: 'Price', type: 'decimal', collectionType: 'none' },
            { name: 'CreatedAt', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Student',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'EnrollmentDate', type: 'DateTime', collectionType: 'none' },
            { name: 'Level', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Enrollment',
          properties: [
            { name: 'StudentId', type: 'int', collectionType: 'none' },
            { name: 'CourseId', type: 'int', collectionType: 'none' },
            { name: 'EnrolledAt', type: 'DateTime', collectionType: 'none' },
            { name: 'Progress', type: 'decimal', collectionType: 'none' },
            { name: 'CompletedAt', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Assessment',
          properties: [
            { name: 'Title', type: 'string', collectionType: 'none' },
            { name: 'CourseId', type: 'int', collectionType: 'none' },
            { name: 'StudentId', type: 'int', collectionType: 'none' },
            { name: 'Score', type: 'decimal', collectionType: 'none' },
            { name: 'MaxScore', type: 'decimal', collectionType: 'none' },
            { name: 'CompletedAt', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['education', 'learning', 'course', 'student']
    },
    {
      id: '6',
      name: 'Inventory Management',
      description: 'Warehouse and inventory control system with suppliers and stock tracking',
      category: 'Logistics',
      icon: 'ContainerOutlined',
      entities: [
        {
          name: 'Warehouse',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Address', type: 'string', collectionType: 'none' },
            { name: 'Capacity', type: 'int', collectionType: 'none' },
            { name: 'ManagerId', type: 'int', collectionType: 'none' }
          ]
        },
        {
          name: 'Item',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'SKU', type: 'string', collectionType: 'none' },
            { name: 'Description', type: 'string', collectionType: 'none' },
            { name: 'UnitPrice', type: 'decimal', collectionType: 'none' },
            { name: 'Weight', type: 'decimal', collectionType: 'none' },
            { name: 'CategoryId', type: 'int', collectionType: 'none' }
          ]
        },
        {
          name: 'Stock',
          properties: [
            { name: 'ItemId', type: 'int', collectionType: 'none' },
            { name: 'WarehouseId', type: 'int', collectionType: 'none' },
            { name: 'Quantity', type: 'int', collectionType: 'none' },
            { name: 'MinimumLevel', type: 'int', collectionType: 'none' },
            { name: 'LastUpdated', type: 'DateTime', collectionType: 'none' }
          ]
        },
        {
          name: 'Supplier',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'ContactEmail', type: 'string', collectionType: 'none' },
            { name: 'Phone', type: 'string', collectionType: 'none' },
            { name: 'Address', type: 'string', collectionType: 'none' },
            { name: 'Rating', type: 'decimal', collectionType: 'none' }
          ]
        },
        {
          name: 'PurchaseOrder',
          properties: [
            { name: 'OrderNumber', type: 'string', collectionType: 'none' },
            { name: 'SupplierId', type: 'int', collectionType: 'none' },
            { name: 'TotalAmount', type: 'decimal', collectionType: 'none' },
            { name: 'Status', type: 'string', collectionType: 'none' },
            { name: 'OrderDate', type: 'DateTime', collectionType: 'none' },
            { name: 'ExpectedDelivery', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['inventory', 'warehouse', 'logistics', 'supply-chain']
    },
    {
      id: '7',
      name: 'Healthcare Management',
      description: 'Healthcare system with patients, doctors, appointments, and medical records',
      category: 'Healthcare',
      icon: 'HeartOutlined',
      entities: [
        {
          name: 'Patient',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'Phone', type: 'string', collectionType: 'none' },
            { name: 'DateOfBirth', type: 'DateTime', collectionType: 'none' },
            { name: 'Address', type: 'string', collectionType: 'none' },
            { name: 'EmergencyContact', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'Doctor',
          properties: [
            { name: 'Name', type: 'string', collectionType: 'none' },
            { name: 'Email', type: 'string', collectionType: 'none' },
            { name: 'Phone', type: 'string', collectionType: 'none' },
            { name: 'Specialty', type: 'string', collectionType: 'none' },
            { name: 'LicenseNumber', type: 'string', collectionType: 'none' },
            { name: 'DepartmentId', type: 'int', collectionType: 'none' }
          ]
        },
        {
          name: 'Appointment',
          properties: [
            { name: 'PatientId', type: 'int', collectionType: 'none' },
            { name: 'DoctorId', type: 'int', collectionType: 'none' },
            { name: 'ScheduledAt', type: 'DateTime', collectionType: 'none' },
            { name: 'Duration', type: 'int', collectionType: 'none' },
            { name: 'Status', type: 'string', collectionType: 'none' },
            { name: 'Notes', type: 'string', collectionType: 'none' }
          ]
        },
        {
          name: 'MedicalRecord',
          properties: [
            { name: 'PatientId', type: 'int', collectionType: 'none' },
            { name: 'DoctorId', type: 'int', collectionType: 'none' },
            { name: 'Diagnosis', type: 'string', collectionType: 'none' },
            { name: 'Treatment', type: 'string', collectionType: 'none' },
            { name: 'Prescription', type: 'string', collectionType: 'none' },
            { name: 'RecordDate', type: 'DateTime', collectionType: 'none' }
          ]
        }
      ],
      tags: ['healthcare', 'medical', 'patient', 'doctor']
    }
  ];

  static getAllTemplates(): EntityTemplate[] {
    return [...this.templates];
  }

  static getTemplateById(id: string): EntityTemplate | undefined {
    return this.templates.find(template => template.id === id);
  }

  static getTemplatesByCategory(category: string): EntityTemplate[] {
    return this.templates.filter(template => template.category === category);
  }

  static getTemplatesByTag(tag: string): EntityTemplate[] {
    return this.templates.filter(template => 
      template.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  static getCategories(): string[] {
    return [...new Set(this.templates.map(template => template.category))];
  }

  static addTemplate(template: Omit<EntityTemplate, 'id'>): EntityTemplate {
    const newTemplate: EntityTemplate = {
      ...template,
      id: Date.now().toString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  static updateTemplate(id: string, updates: Partial<EntityTemplate>): boolean {
    const index = this.templates.findIndex(template => template.id === id);
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates };
      return true;
    }
    return false;
  }

  static deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(template => template.id === id);
    if (index !== -1) {
      this.templates.splice(index, 1);
      return true;
    }
    return false;
  }
}
