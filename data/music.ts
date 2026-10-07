export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  href: string;
  audioSrc: string | null;
};

// Audio is served locally. Use null for any track awaiting a supplied file.
export const musicTracks: readonly MusicTrack[] = [
  {
    id: "nights", title: "Nights", artist: "Frank Ocean",
    cover: "/images/music/blonde.jpg",
    href: "https://open.spotify.com/track/4Jle0Cjj88YkM7jbAjiFjf",
    audioSrc: "/audio/nights.mp3",
  },
  {
    id: "futura-free", title: "Futura Free", artist: "Frank Ocean",
    cover: "/images/music/blonde.jpg",
    href: "https://open.spotify.com/track/5k8LB57xOq8UUNVaKWSqrf",
    audioSrc: "/audio/futura-free.mp3",
  },
  {
    id: "japanese-denim", title: "Japanese Denim", artist: "Daniel Caesar",
    cover: "/images/music/japanese-denim.jpg",
    href: "https://open.spotify.com/track/7IVukH71OXfAu3KudrrizN",
    audioSrc: "/audio/japanese-denim.mp3",
  },
  {
    id: "les", title: "Les", artist: "Childish Gambino",
    cover: "/images/music/camp.jpg",
    href: "https://open.spotify.com/track/1gkoTg9lUdJJTxIjrkZDKn",
    audioSrc: "/audio/les.mp3",
  },
];
