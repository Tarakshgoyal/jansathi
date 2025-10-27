# Jansarthi Development Instructions

# Project Description

This is government App to report the issues user are facing in their area.
It is mainly focused on Uttrakhand India.

Issues types are:

- Jal Samasya
- Bijli Samasya
- Sadak Samasya
- Kachra Samasya
- Severage Samasya

# IMPORTANT INSTRUCTION

- **Focus on Clarity and Usability:** The primary goal is a **clean, straightforward UI/UX**. It must be **easy to understand and use**, avoiding unnecessary complexity or visual clutter. Functionality and ease of task completion are more important than elaborate aesthetics. Think **task-oriented design**.

- **Mobile-First Approach:** Design and develop **primarily for mobile devices**. Ensure the core reporting functionality works flawlessly on smaller screens. Tablet or desktop layouts are secondary.

- **Accessibility is Mandatory:** The app **must comply** with **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA**. This means:

  - **Sufficient Color Contrast:** Text and important UI elements must have enough contrast against their background (generally 4.5:1 for normal text, 3:1 for large text).
  - **Readable Text:** Use clear fonts and ensure text can be resized by the user without breaking the layout.
  - **Screen Reader Compatibility:** All elements, images, and controls must be properly labeled for screen readers (like TalkBack or VoiceOver).
  - **Keyboard Navigation:** All interactive elements must be usable with a keyboard interface.
  - **Adequate Touch Targets:** Buttons and interactive elements must be large enough to be easily tapped (aim for at least 44x44 pixels).

- **Build User Trust:** As an official government application, establishing trust is crucial:

  - **Official Branding:** Display official **Government/State emblems** clearly (e.g., on the initial loading screen and main app header).
  - **Transparency:** Make the **Privacy Policy** and **Terms & Conditions** readily available and easy to find within the app.

- **Optimize for fast loading times** and smooth operation. This includes optimizing images, writing efficient code, and minimizing data usage.

- **Consider Offline Use:** Users might need to report issues from areas with poor or no internet connectivity. Evaluate and potentially implement **offline capabilities**, such as allowing users to draft a report offline and submit it automatically when connectivity is restored.

# Project Instructions

- We are using bun and bunx as the package manager.

# Frontend Instructons

## UI Instructions

For the frontend we are using gluestack-ui v3.

### The components it have.

- Accordion: A vertically stacked set of interactive headings that each reveal a section of content.
- Actionsheet: A bottom sheet that presents a set of actions or options to the user.
- Alert: Displays a callout for user attention.
- Alert Dialog: A modal dialog that interrupts the user with important content and expects a response.
- Avatar: An image element with a fallback for representing the user.
- Badge: Displays a small badge or a visual indicator for status or notification.
- Box: A layout component that serves as a wrapper for content.
- Button: Displays a button or a component that looks like a button.
- Card: Displays a card with header, content, and footer.
- Center: Centers its child horizontally and vertically within its container.
- Checkbox: A control that allows the user to toggle between checked and unchecked states.
- Divider: Visually separates content or elements.
- Drawer: A panel that slides in from the side of the screen to show additional content.
- Fab: A floating action button used for primary actions.
- Form Control: A wrapper component that provides context for form inputs.
- Grid: A layout component for arranging elements in rows and columns.
- Heading: A text component used for section titles or headings.
- HStack: A layout component that arranges its children horizontally.
- Icon: Displays vector icons or custom icon components.
- Image: Displays an image with support for styling and responsive layouts.
- Input: Displays a text input field for user data entry.
- Link: Navigational component used to link between pages or sections.
- Menu: Displays a list of actions or options, typically triggered by a button.
- Modal: Displays content in a dialog overlaid on top of the page.
- Popover: Displays additional content in a popup, triggered by a button or hover.
- Portal: Renders children into a new part of the DOM hierarchy, useful for modals or tooltips.
- Pressable: A component that responds to press (touch/click) interactions.
- Progress: Displays a visual indicator of task completion progress.
- Radio: A group of mutually exclusive options where only one can be selected.
- Select: Displays a list of selectable options, triggered by a button.
- Skeleton: Displays a placeholder while the actual content is loading.
- Slider: Allows users to select a value from a range by sliding a handle.
- Spinner: Displays a loading indicator for ongoing processes.
- Switch: A toggle component that switches between on and off states.
- Table: Displays structured data in rows and columns.
- Text: A component for displaying text content.
- Textarea: A multi-line input field for longer text entries.
- Toast: Displays brief notifications or messages.
- Tooltip: Displays contextual information when hovering or focusing on an element.
- VStack: A layout component that arranges its children vertically.

### To install one of these packages you can use these commands for example:

```bash
bunx gluestack-ui add form-control
```

```bash
bunx gluestack-ui add alert
```

## Code Instructions

- All the documentation of gluestack-ui v2 components is in docs/gluestack-ui-v2/ folder.
- All the code in frontend should be written in typescript for .ts file and typescript + xml in .tsx files.
- All the typescript code should have type written with it.
- Create a config file where you will save translation of whatever you are writing in the ui in english and hindi such that when user switches language all text in the app is changed to hindi according to the config.
- Don't use style of react native instead we have native wind support ie we have tailwind support so always use className to give styling.
- Never Hardcode any colors and use theme.
