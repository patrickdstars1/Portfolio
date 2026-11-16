// Technologies and tools Bank has experience using.
// No proficiency levels on purpose. To add one: append { name, icon? } to a group.
// `icon` is a key in src/components/TechIcon.jsx (brand icons); omit it for a generic mark.
export const skillGroups = [
  {
    id: 'languages',
    title: { en: 'Languages', th: 'ภาษา' },
    items: [
      { name: 'Python', icon: 'python' },
      { name: 'JavaScript', icon: 'javascript' },
      { name: 'PHP', icon: 'php' },
      { name: 'SQL' },
      { name: 'HTML', icon: 'html' },
      { name: 'CSS', icon: 'css' },
    ],
  },
  {
    id: 'web',
    title: { en: 'Web & backend', th: 'Web และ backend' },
    items: [
      { name: 'React', icon: 'react' },
      { name: 'Next.js', icon: 'nextjs' },
      { name: 'Wix', icon: 'wix' },
      { name: 'Backend Development' },
      { name: 'API Development' },
      { name: 'MySQL', icon: 'mysql' },
      { name: 'PostgreSQL', icon: 'postgresql' },
    ],
  },
  {
    id: 'tools',
    title: { en: 'Tools & platforms', th: 'เครื่องมือและแพลตฟอร์ม' },
    items: [
      { name: 'GitHub', icon: 'github' },
      { name: 'GitLab', icon: 'gitlab' },
      { name: 'Docker', icon: 'docker' },
      { name: 'Postman', icon: 'postman' },
      { name: 'Figma', icon: 'figma' },
      { name: 'Power Automate' },
    ],
  },
  {
    id: 'ai',
    title: { en: 'AI tools', th: 'เครื่องมือ AI' },
    items: [
      { name: 'Claude', icon: 'claude' },
      { name: 'Dreamina' },
      { name: 'AI-assisted Development' },
      { name: 'AI-powered Creative Workflows' },
    ],
  },
  {
    id: 'engineering',
    title: { en: 'Engineering & automation', th: 'Engineering และ automation' },
    items: [
      { name: 'Software Troubleshooting' },
      { name: 'Code Debugging' },
      { name: 'Server Management' },
      { name: 'Workflow Automation' },
      { name: 'Email Automation' },
      { name: 'Production Software Support' },
    ],
  },
]
