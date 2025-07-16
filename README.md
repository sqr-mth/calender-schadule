# Calendar Schedule Application

A modern, interactive calendar application built with Next.js, React, and Ant Design. This application allows users to manage tasks by adding, editing, and tracking them on a calendar interface.

![Calendar Application Screenshot](https://placehold.co/600x400?text=Calendar+App+Screenshot)

## Features

- **Interactive Calendar**: View and manage tasks in a monthly calendar view
- **Task Management**: Create, edit, and delete tasks
- **Status Tracking**: Track task status (In Progress, Pending, Completed)
- **Persistent Storage**: Tasks are saved using Recoil persistence
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Next.js**: React framework for server-side rendering and static generation
- **React**: JavaScript library for building user interfaces
- **Ant Design**: UI component library
- **Recoil**: State management
- **TypeScript**: Static typing
- **Tailwind CSS**: Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/calender-schadule.git
   cd calender-schadule
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:8080](http://localhost:8080) with your browser to see the application.

## Usage

1. **View Tasks**: Tasks are displayed as colored badges on the calendar
   - Green: Completed tasks
   - Yellow: In Progress tasks
   - Red: Pending tasks

2. **Add Task**: 
   - Click on any date in the calendar
   - Fill in the task details in the modal form
   - Click 'OK' to save

3. **Edit Task**:
   - Click directly on a task in the calendar
   - Modify the details in the modal form
   - Click 'OK' to save changes

## Project Structure

```
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app directory
│   │   ├── page.tsx   # Root page
│   │   ├── calender/  # Calendar route
│   │   └── tasks/     # Tasks route
│   ├── components/    # React components
│   │   ├── Calender/  # Calendar components
│   │   └── Nav.tsx    # Navigation component
│   └── state/         # Recoil state management
│       └── tasks.ts   # Task state definitions
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
