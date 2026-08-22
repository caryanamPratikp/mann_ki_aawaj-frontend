import React from 'react';
import { MoreHorizontal, Reply, Copy, Flag, VolumeX, ShieldAlert, Edit, Trash2 } from 'lucide-react';
import { Dropdown, DropdownItem } from '../common/Dropdown.jsx';

export function CommentMenu({ isOwner, onReply, onCopy, onEdit, onDelete, onReport, onMute, onBlock }) {
  return (
    <Dropdown placement="up" trigger={<MoreHorizontal size={18} style={{ color: 'var(--hurricane)' }} />}>
      {isOwner ? (
        <>
          <DropdownItem icon={Edit} onClick={onEdit}>
            Edit
          </DropdownItem>
          <DropdownItem icon={Copy} onClick={onCopy}>
            Copy
          </DropdownItem>
          <DropdownItem icon={Trash2} onClick={onDelete} danger>
            Delete
          </DropdownItem>
        </>
      ) : (
        <>
          <DropdownItem icon={Reply} onClick={onReply}>
            Reply
          </DropdownItem>
          <DropdownItem icon={Copy} onClick={onCopy}>
            Copy
          </DropdownItem>
          <DropdownItem icon={Flag} onClick={onReport} danger>
            Report Comment
          </DropdownItem>
          <DropdownItem icon={VolumeX} onClick={onMute}>
            Mute User
          </DropdownItem>
          <DropdownItem icon={ShieldAlert} onClick={onBlock} danger>
            Block User
          </DropdownItem>
        </>
      )}
    </Dropdown>
  );
}
