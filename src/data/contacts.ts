export interface ContactChannel {
  id: string;
  name: string;
  handle: string;
  url: string;
  protocol: string;
  color: string;
  icon: string;
  description: string;
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'telegram',
    name: 'Telegram Secure Comms',
    handle: '@sm000kyy',
    url: 'https://t.me/sm000kyy',
    protocol: 'DIRECT_MESSAGING',
    color: '#00f0ff',
    icon: '✈️',
    description: 'Instant encrypted messaging, project inquiries & collaboration.'
  },
  {
    id: 'facebook',
    name: 'Facebook Terminal',
    handle: 'ZenTod69',
    url: 'https://www.facebook.com/ZenTod69',
    protocol: 'SOCIAL_NETWORK',
    color: '#1877f2',
    icon: '🌐',
    description: 'Social updates, community discussions & developer networking.'
  },
  {
    id: 'email',
    name: 'Encrypted Mail Drop',
    handle: 'zentod000@gmail.com',
    url: 'mailto:zentod000@gmail.com',
    protocol: 'SMTP_DISPATCH',
    color: '#ff007f',
    icon: '✉️',
    description: 'Direct formal correspondence, contract proposals & technical audits.'
  }
];
