

export const mockLiveStreams = [
  {
    id: '1',
    title: 'Late Night Chill Beats & Coding 💻',
    userName: 'AlexCodes',
    userImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&h=450&fit=crop',
    viewers: 1240,
    category: 'discover',
    isLive: true,
    description: 'Relaxing beats to code to. Feel free to ask any dev questions',
    comments: [
      { id: 'c1', userName: 'DevGuru', userImage: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=50&h=50&fit=crop', text: 'Love the playlist', timestamp: new Date() },
      { id: 'c2', userName: 'SaraTech', userImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop', text: 'What font are you using?', timestamp: new Date() },
    ]
  },
  {
    id: '2',
    title: 'Extreme Mountain Biking 🚵‍♂️',
    userName: 'MountainMike',
    userImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1544191173-834f5d9d4513?w=800&h=450&fit=crop',
    viewers: 3500,
    category: 'discover',
    isLive: true,
    description: 'Downhill madness in the Alps. Dont blink',
    comments: [
      { id: 'c3', userName: 'AdrenalineJunkie', userImage: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=50&h=50&fit=crop', text: 'That jump was insane!', timestamp: new Date() },
    ]
  },
  {
    id: '3',
    title: 'Morning Yoga and Meditation 🧘‍♂️',
    userName: 'ZenMaster',
    userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop',
    viewers: 850,
    category: 'following',
    isLive: true,
    description: 'Start your day with peace and mindfulness.',
    comments: [
      { id: 'c4', userName: 'FlowState', userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop', text: 'Namaste 🙏', timestamp: new Date() },
    ]
  },
  {
    id: '4',
    title: 'Indie Game Development Log #42',
    userName: 'PixelPioneer',
    userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=450&fit=crop',
    viewers: 0,
    category: 'previous',
    isLive: false,
    description: 'Recording of my latest workshop on procedural generation.',
    comments: []
  },
  {
    id: '5',
    title: 'Live DJ Set Vibes 🌅',
    userName: 'DJSonic',
    userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1514525253344-f814d8743585?w=800&h=450&fit=crop',
    viewers: 0,
    category: 'previous',
    isLive: false,
    description: 'The recording of our beach party set last Friday.',
    comments: []
  }
];
