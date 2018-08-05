# Models
Below is documentation regarding the models that are used in this project. 

## Budget
This model represents the different budget categories that an `Item` may fall under. Budgets should be created for every semester with a specific maximum `amount` that can be drawn from it.
- `name` (String): the name of the budget
    - Must be unique.
- `semester` (String): the semester that the budget applies to
    - Format: [SeasonName][Year]
    - Example: Spring2018
- `amount` (Number): the total budget amount ($)
- `items` (Array): an array consisting of every Item._id that is in this budget

## Item
This model represents the line items that a requestor is recording under a Budget. The requestor may be seeking reimbursement, as recorded in the `reimbursementType` row.
- `name` (String): the name of the user to be reimbursed
- `email` (String): the email of the user to be reimbursed
- `description` (String): a description of the reimbursement
- `amount` (Number): the amount of the reimbursement ($)
- `budget` (ObjectId): the budget that this item is drawing from
- `date` (Date): the date of the transaction
- `reimbursementType` (String): the preferred method of reimbursement
- `additionalInfo` (String): additional information given by the requestor
- `attachments` (Array): an array of URLs to attachments

## Reset Requests
This is no longer implemented because reset tokens are now part of the `User` model.

## Roles
This model represents the different roles that a user can have along with the appropriate permissions. For example, the role 'admin' would have all permissions given to it, while the role 'user' would only have reimbursement request permissions.
- `roleName` (String): the name of the role
- `permissions` (Array): an array of Strings that represents the permissions that a user can have
    - Acceptable permissions:
        - `roles.view`
        - `roles.edit`
        - `items.view`
        - `items.edit`
        - `[budget].items.view`
        - `[budget].items.edit`
        - `budget.view`
        - `budget.edit`
        - `users.view`
        - `users.edit`
        - `reports.view`
    - Users can always view their own items and roles.
    - `items.view` and `items.edit` permissions are for all items, while `[budget].items.view` and `[budget].items.edit` are restricted to specific budgets.
  
## User
This model represents each user of ZBudgeT. It contains user information and tokens.
- `name` (String): the full name of the user
    - This string is required and whitespace is trimmed.
- `email` (String): the email address of the user
    - This string is required, must be unique, and whitespace is trimmed.
- `emailMD5` (String): the MD5 hash of the email address is stored for use with [Gravatar](http://en.gravatar.com/site/implement/).
- `roles` (Array): an array of strings that represent the roles that are assigned to the user
- `apiKey` (String): the API Key the user can use to programattically interact with the application
    - This string is required and must be unique.
- `resetToken` (String): a token used to access the user's password reset if the last reset was never completed.
- `lastSignedIn` (Date): the Date object of the most recent deserialization of the user's logged-in session.