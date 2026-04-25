I'll use the following technologies:

Frontend:

- Next.js on the front-end
- tailwindcss for the styling
- Heroui for the UI
- to implement forms we will use zod with a custom hook to handle the validations and submit.
- Toast to show messages to the user.
- We apply the best practices for the frontend, choose a good architecture

Backend:

- Supabase as the database
- The architecture is described here: @docs/backend-architecture.md (make sure to adapt it to the needs.)
- For the database, we will use prisma.
- Apply the best practices for the backend
- Will deploy this on Railway
- S3 for the images

Overall:

- Make sure to also create .env file with the placeholder for the necessary keys.

Features:

- The users should be able to login with email and password.
  Note: right now we will not allow users to create their own accounts, we will only allow them to login with their existing accounts. And you don't need to worry about creating it, later on I will create a script for it.
- The users should be able to create their plans.
  Note: The plan is a group of workouts types, like: Push, pull, legs or upper and lower body or many others. they will be able to configure each workout day.
- Inside each workout, the users should be able to create their exercises and sets.
  Note: The workouts it will be based in exercices, but one exercise can have multiple sets, and the type of each set can also be different. Like working set, rest set, recognizing set, etc.
  For exemple: Squats 1x (recognizing set), Squats 2x (rest set), Squats 3x (working set) - this is for only one exercise.
- When the users go to the gym, they should be able to select the plan they are currently into, choose the workout they want to do, and fill the weight and reps for each exercise and set.
- We should have a calendar for the users to see their workouts and their progress.
- We should also have a dashboard for the users to see their progress. You should search and see which is the best way to show charts and graphs here.
- The user should be able to share an open link with their friends or coach, so they can see their progress and what are the workouts and others.
- Weekly the users can also be able to add weekly photos to track their progress as well.
