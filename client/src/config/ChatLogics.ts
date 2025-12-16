/* eslint-disable @typescript-eslint/no-explicit-any */
export const getSender = (loggedUser: any, users: any[]) => {
  // If users array is empty or undefined, return safe fallback
  if (!users || users.length < 2) return "Unknown User";
  
  // Logic: Return the name of the user who is NOT the logged-in user
  return users[0]?._id === loggedUser?._id ? users[1].name : users[0].name;
};

export const getSenderFull = (loggedUser: any, users: any[]) => {
  if (!users || users.length < 2) return users[0];
  return users[0]._id === loggedUser?._id ? users[1] : users[0];
};

// ... (keep existing getSender code above)

export const isSameSender = (messages: any[], m: any, i: number, userId: string) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1].sender._id !== m.sender._id ||
      messages[i + 1].sender._id === undefined) &&
    messages[i].sender._id !== userId
  );
};

export const isLastMessage = (messages: any[], i: number, userId: string) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameSenderMargin = (messages: any[], m: any, i: number, userId: string) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33; // Margin for messages from the same sender (to align with avatar)
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0; // No margin needed (avatar is present)
  else return "auto"; // Push to right for logged in user
};

export const isSameUser = (messages: any[], m: any, i: number) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};