import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideNotification } from '../../store/slices/notificationSlice';
import Notification from './Notification';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const notification = useSelector((state) => state.notification.notification);

  if (!notification) return null;

  return (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={() => dispatch(hideNotification())}
    />
  );
};

export default NotificationManager;
