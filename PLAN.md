# korean-study-app
Intro to Code repo to build Korean study app


| Section  | Description | 
| -------- | -------- | 
| Pitch    | "I'm building a Korean-language study app because I want to be able to consistently revisit material and track how well I know it." I would like to use this app daily.   | 
| Features | See feature table below   | 
| Database | |
| Tests    | |
| Technologies | |
| Design | |
| Risks and Cuts | |


| Number | Feature  | User Story | 
| -------| -------- | -------- |
| 1 | Sign up and Log in | A new visitor can create their own account from inside your app, then log in and log out. Every account is a row in your users table. Each user sees only their own data. |
| 2 | Data Model | Data model	A users table plus at least 2 tables of your own, connected by a relationship (e.g., entries belong to categories). |
| 3 | Create / Read / Update / Delete | Add an item, view the list, open one item's detail page, edit it, and delete it with an "are you sure?" confirmation. |
| 4 | Validation | Required fields can't be left blank. Show a friendly message if someone tries. |
| 5 | Stars | Users can star items and see a "starred" view. All stars live in one stars table (a junction table) where each row references a user and an item: "this user starred this item." One table for everyone, not one per user. |
| 6 |Search | Search or filter, plus sort (e.g., newest first, highest rated). |
| 7 |Dashboard | At least one chart and 2–3 summary stats computed from your data (count, average, best month). |
