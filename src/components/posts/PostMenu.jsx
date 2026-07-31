import React from 'react';
import { MoreHorizontal, Bookmark, EyeOff, VolumeX, ShieldAlert, Flag, Trash2 } from 'lucide-react';
import { Dropdown, DropdownItem } from '../common/Dropdown.jsx';

export function PostMenu({ isSaved, isOwner, onDelete, onSave, onHide, onMute, onBlock, onReport }) {
  return (
    <Dropdown trigger={<MoreHorizontal size={20} style={{ color: 'var(--hurricane)' }} />}>
      {isOwner && (
        <DropdownItem icon={Trash2} onClick={onDelete} danger>
          Delete Post
        </DropdownItem>
      )}
      <DropdownItem icon={Bookmark} onClick={onSave}>
        {isSaved ? 'Remove from Saved' : 'Save Post'}
      </DropdownItem>
      <DropdownItem icon={EyeOff} onClick={onHide}>
        Hide Post
      </DropdownItem>
      {!isOwner && (
        <>
          <DropdownItem icon={VolumeX} onClick={onMute}>
            Mute User
          </DropdownItem>
          <DropdownItem icon={ShieldAlert} onClick={onBlock} danger>
            Block User
          </DropdownItem>
          <DropdownItem icon={Flag} onClick={onReport} danger>
            Report Post
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
