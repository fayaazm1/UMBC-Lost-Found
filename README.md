# UMBC-Lost-Found
UMBC Lost &amp; Found term project for the 645 subject.

🧠 Database Overview
Data is stored in a PostgreSQL database named lost_and_found.

📦 Key Tables
posts — Stores both Lost & Found items

users — Stores user credentials

🗂️ Lost vs Found Items
Both item types are stored in the posts table and are distinguished using the report_type field:

'Lost' for lost items

'Found' for found items

📥 Load the Sample Database
To restore the data on your local machine:

createdb lost_and_found
psql -U postgres -d lost_and_found -f db/lost_and_found_dump.sql
