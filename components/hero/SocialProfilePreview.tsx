import Image from "next/image";
import { ArrowLeft, CalendarDays, Link as LinkIcon, MapPin, Menu, SlidersHorizontal, Users } from "lucide-react";
import { githubPreview, xPreview } from "@/data/social-profile-previews";
import { socials } from "@/data/socials";
import styles from "./SocialProfilePreview.module.css";

export function SocialProfilePreview({ social }: { social: (typeof socials)[number] }) {
  if (social.label === "GitHub") {
    return (
      <div className={styles.github} data-profile-preview="github">
        <div className={styles.githubBar} aria-hidden="true">
          <Menu size={17} />
          <Image className={styles.whiteLogo} src={social.logo} alt="" width={23} height={23} />
          <span className={styles.githubTools}><span className={styles.signIn}>Sign in</span><SlidersHorizontal size={16} /></span>
        </div>
        <div className={styles.githubBody}>
          <div className={styles.githubIdentity}>
            <Image className={styles.githubAvatar} src={githubPreview.avatar} alt="" width={76} height={76} loading="eager" />
            <div>
              <p className={styles.githubName}>{githubPreview.name}</p>
              <p className={styles.githubUsername}>{githubPreview.username}</p>
            </div>
          </div>
          <p className={styles.githubBio}>{githubPreview.bio}</p>
          <p className={styles.githubStats}>
            <Users size={13} aria-hidden="true" />
            <span><strong>{githubPreview.followers}</strong> followers <span aria-hidden="true">·</span> <strong>{githubPreview.following}</strong> following</span>
          </p>
          <div className={styles.githubFollow} aria-hidden="true">Follow</div>
        </div>
      </div>
    );
  }

  if (social.label === "X") {
    return (
      <div className={styles.x} data-profile-preview="x">
        <div className={styles.xBar}>
          <ArrowLeft size={17} aria-hidden="true" />
          <div><p className={styles.xBarName}>{xPreview.name}</p><p className={styles.xPostCount}>{xPreview.posts} posts</p></div>
          <Image className={styles.whiteLogo} src={social.logo} alt="" width={17} height={17} />
        </div>
        <div className={styles.xBanner} />
        <div className={styles.xBody}>
          <div className={styles.xAvatar} style={{ backgroundColor: xPreview.avatarColor }} aria-label="Green profile avatar" role="img" />
          <p className={styles.xName}>{xPreview.name}</p>
          <p className={styles.xHandle}>@{xPreview.username}</p>
          <div className={styles.xMetadata}>
            <span><MapPin size={13} aria-hidden="true" />{xPreview.location}</span>
            <span className={styles.xWebsite}><LinkIcon size={13} aria-hidden="true" />{xPreview.website}</span>
            <span><CalendarDays size={13} aria-hidden="true" />Joined {xPreview.joined}</span>
          </div>
          <p className={styles.xStats}><span><strong>{xPreview.following}</strong> Following</span><span><strong>{xPreview.followers}</strong> Followers</span></p>
          <div className={styles.xActions} aria-hidden="true"><span>Mention</span><span>Follow</span></div>
        </div>
      </div>
    );
  }

  // LinkedIn has no verified profile screenshot yet. Email is a contact address,
  // so neither should masquerade as a captured account page.
  return (
    <div className={styles.simple} data-profile-preview={social.label.toLowerCase()}>
      <Image src={social.logo} alt="" width={28} height={28} />
      <p className={styles.simpleTitle}>{social.label === "Email" ? "Email" : "LinkedIn profile"}</p>
      <p className={styles.simpleHandle}>{social.handle}</p>
    </div>
  );
}
