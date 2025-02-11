import { User } from "@/models/user";
import AvatarList from "./AvatarList";

const PeopleAvatarList = ({
  people,
  displayCount = 3,
  size,
  text,
}: {
  people: User[];
  displayCount: number;
  size: number;
  text?: string;
}) => {
  return (
    <AvatarList<User>
      items={people}
      size={size}
      displayCount={displayCount}
      text={text}
      background={"white"}
      getId={(user) => user.id}
      getImageUrl={(user) => user.avatarUrl}
      getFallbackText={(user) => user.username.slice(0, 2)}
    />
  );
};

export default PeopleAvatarList;
