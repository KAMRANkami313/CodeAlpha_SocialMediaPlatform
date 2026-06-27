import UserListModal from './UserListModal';

const LikersModal = ({ likers = [], onClose }) => {
  return (
    <UserListModal
      title="Likes"
      users={likers}
      onClose={onClose}
      emptyMessage="No likes yet"
      icon="heart"
    />
  );
};

export default LikersModal;