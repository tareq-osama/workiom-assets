// lib/content.ts

export type ContentPoint = { title: string; body: string };

export const BUSINESS_OVERVIEW = {
  problem: {
    eyebrow: 'The Problem',
    headline: 'Companies Must Compete to Survive',
    points: [
      {
        title: 'Adapting Quickly to Market Dynamics',
        body: 'Businesses need swift, cost-effective adaptation to market shifts, often impeded by time and financial investment.',
      },
      {
        title: 'IT Department Overload',
        body: 'Constant projects often lead to delays in new software development and system integration for IT departments.',
      },
      {
        title: 'Essential Digital Workspace',
        body: 'In the post-COVID era, a digital workspace is crucial not just for operational agility, but also for retaining employees who seek flexible and modern work environments.',
      },
    ] as ContentPoint[],
  },
  whatIsWorkiom: {
    eyebrow: 'What is Workiom',
    headline:
      'Workiom is a flexible digital platform designed to streamline team tasks, data and automate processes.',
    points: [
      {
        title: 'Digital Process Creation',
        body: 'It enables team leaders to digitize and build their own solutions and processes with ease, eliminating the need for in-depth technical skills. This accessibility allows for innovation and optimization in the workspace by a diverse range of users.',
      },
      {
        title: 'Team and Task Oversight',
        body: 'Workiom provides essential tools for the efficient management and monitoring of teams and tasks. This feature ensures smooth operational flow and enhanced productivity, leading to more effective task completion.',
      },
      {
        title: 'Data Handling',
        body: 'The platform includes a user-friendly system for setting up, managing, and organizing data. This approach to data management simplifies data operations, making it easier and more effective for users to handle information.',
      },
    ] as ContentPoint[],
  },
  mission:
    'Empower businesses with an intuitive digital platform to streamline task management, data organization, and process automation, fostering innovation and operational efficiency.',
  vision:
    'Become a global leader in digital workspace solutions, revolutionizing how organizations manage, automate, and optimize their operations for a future of agile and efficient workplaces.',
};

export type SupportiveMessage = { title: string; quote: string; body: string };

export const KEY_MESSAGING = {
  coreMessage:
    'Empower Your Team with Workiom: Streamlining Tasks, Data, and Processes for Optimal Efficiency',
  tagline: 'Empower Teams, Simplify Work!',
  supportiveMessages: [
    {
      title: 'Revolutionize Team Workflow',
      quote: 'Digital Process Simplified',
      body: 'Discover the ease of digital transformation with Workiom. Our tools are designed to simplify your digital processes, enabling effortless creation and customization. Embrace innovation and optimize your workspace with accessible, user-friendly solutions.',
    },
    {
      title: 'Maximize Productivity',
      quote: 'Efficient Team and Task Management',
      body: "Elevate your team's productivity to new heights with Workiom. Our comprehensive suite of tools ensures smooth operations and effective task management, driving success through optimized workflows and enhanced team coordination.",
    },
    {
      title: 'Simplify Data Handling',
      quote: 'Intuitive Data Management at Your Fingertips',
      body: 'Streamline your data management effortlessly with Workiom. Our intuitive system empowers you to organize, manage, and configure data seamlessly, bolstering your decision-making process and operational efficiency.',
    },
    {
      title: 'Automate for Efficiency',
      quote: "Unleash Automation with Workiom's No-Code Magic",
      body: "Harness the power of automation without the complexity. Workiom's no-code solutions transform tedious tasks into efficient workflows, liberating your team to focus on strategic growth and fostering a culture of innovation.",
    },
    {
      title: 'Insightful Performance Tracking',
      quote: 'Visibility and Transparency for Enhanced Oversight',
      body: "Achieve greater oversight with Workiom's advanced tracking capabilities. Monitor team performance effortlessly with our powerful dashboards, gaining essential insights for informed decision-making and fostering a transparent operational environment.",
    },
    {
      title: 'AI-Powered Customization',
      quote: 'Workiom AI: Your Workspace, Redefined',
      body: 'Experience the future of workspace customization with Workiom AI. Describe your ideal setup in plain language and let our AI take care of the rest. No complex configurations—just a smart, intuitive application that evolves with your needs.',
    },
  ] as SupportiveMessage[],
};

export const BRAND_VOICE_TRAITS: ContentPoint[] = [
  {
    title: 'Friendly Expert',
    body: 'Talks like a friend, occasionally using humor to simplify complex tech concepts.',
  },
  {
    title: 'Smart with a Smile',
    body: 'Demonstrates expertise with an occasional witty remark, making interactions engaging.',
  },
  {
    title: 'Innovative and Clear',
    body: 'Always looking ahead with a clear, easy-to-understand approach, and a light-hearted touch.',
  },
  {
    title: 'Empowering and Positive',
    body: 'Motivates users in a cheerful way, making challenging tasks feel more manageable.',
  },
  {
    title: 'Welcoming and Inclusive',
    body: 'Creates a sense of community, using a warm and approachable style to make everyone feel included.',
  },
];

export const WORKIOM_AI_INTRO =
  'Experience the future of workspace customization with Workiom AI. Describe your ideal setup in plain language and let our AI take care of the rest. No complex configurations—just a smart, intuitive application that evolves with your needs.';

export const WORKIOM_AI_LOGO = {
  colored: '/api/file/r2/6a7eae6f00118204206b/workiom-ai-colored.svg?v=2',
  light: '/api/file/r2/6a7eae49003d79e90f71/workiom-ai-light.svg?v=2',
};
