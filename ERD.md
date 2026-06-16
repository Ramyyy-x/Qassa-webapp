# Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    profiles ||--o{ appointments : "makes"
    profiles ||--o{ reviews : "writes"
    profiles ||--o{ notifications : "receives"
    services ||--o{ appointments : "booked for"
    appointments ||--o| reviews : "has"

    profiles {
        uuid id PK
        text full_name
        text role "admin or customer"
        text email
    }

    services {
        uuid id PK
        text nameihi
        integer duration_minutes
        integer price
        text image_url
    }

    working_hours {
        uuid id PK
        integer day_of_week "0-6"
        time open_time
        time close_time
        boolean is_closed
    }

    appointments {
        uuid id PK
        uuid customer_id FK
        uuid service_id FK
        date appointment_date
        time appointment_time
        text status "pending, confirmed, completed, cancelled"
    }

    reviews {
        uuid id PK
        uuid appointment_id FK
        uuid customer_id FK
        integer rating "1-5"
        text comment
        timestamp created_at
    }

    notifications {
        uuid id PK
        uuid user_id FK
        text title
        text message
        boolean is_read
        timestamp created_at
    }
```
