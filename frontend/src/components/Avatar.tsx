import Icon from "@/components/Icon";

type AvatarProps = {
  initials?: string;
  size?: "small" | "large";
};

export default function Avatar({ initials = "JD", size = "small" }: AvatarProps) {
  if (size === "large") {
    return (
      <div aria-label="Student profile photo" className="profile-avatar">
        <Icon name="user" size={58} />
      </div>
    );
  }

  return <span className="mini-avatar">{initials}</span>;
}
