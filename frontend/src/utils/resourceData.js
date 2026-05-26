export const CURRENT_USER_KEY = "resourceBookingCurrentUser";
export const BOOKINGS_KEY = "resourceBookingBookings";
export const USERS_KEY = "resourceBookingUsers";
export const ROOMS_KEY = "resourceBookingRooms";
export const MAINTENANCE_KEY = "resourceBookingMaintenanceRooms";
export const ROOM_STATUS_KEY = "resourceBookingRoomStatuses";

export const roomCatalog = [
  {
    id: "conference-room-a",
    name: "Conference Room A",
    capacity: 20,
    location: "Floor 3, East Wing",
    projector: true,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "conference-room-b",
    name: "Conference Room B",
    capacity: 14,
    location: "Floor 2, North Wing",
    projector: true,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "training-hall",
    name: "Training Hall",
    capacity: 40,
    location: "Floor 4, Center Block",
    projector: true,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ai-lab",
    name: "AI Lab",
    capacity: 12,
    location: "Floor 5, Innovation Hub",
    projector: true,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "presentation-room",
    name: "Presentation Room",
    capacity: 16,
    location: "Floor 1, Lobby Annex",
    projector: true,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "discussion-cabin",
    name: "Discussion Cabin",
    capacity: 8,
    location: "Floor 2, Quiet Corner",
    projector: false,
    wifi: true,
    ac: true,
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
  },
];

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  } catch {
    return null;
  }
};

export const getBookings = () => {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
};

export const saveBookings = (bookings) => {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
};

export const getRooms = () => {
  try {
    const savedRooms = JSON.parse(localStorage.getItem(ROOMS_KEY) || "[]");

    if (Array.isArray(savedRooms) && savedRooms.length > 0) {
      return savedRooms;
    }

    saveRooms(roomCatalog);
    return roomCatalog;
  } catch {
    saveRooms(roomCatalog);
    return roomCatalog;
  }
};

export const saveRooms = (rooms) => {
  localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
};

export const getMaintenanceRooms = () => {
  try {
    const savedRooms = JSON.parse(localStorage.getItem(MAINTENANCE_KEY) || "[]");
    return Array.isArray(savedRooms) ? savedRooms : [];
  } catch {
    return [];
  }
};

export const saveMaintenanceRooms = (rooms) => {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(rooms));
};

export const getRoomStatusOverrides = () => {
  try {
    const savedStatus = JSON.parse(localStorage.getItem(ROOM_STATUS_KEY) || "{}");
    return savedStatus && typeof savedStatus === "object" ? savedStatus : {};
  } catch {
    return {};
  }
};

export const saveRoomStatusOverrides = (roomStatuses) => {
  localStorage.setItem(ROOM_STATUS_KEY, JSON.stringify(roomStatuses));
};

export const REVIEWS_KEY = "resourceBookingReviews";

const seedReviews = [
  {
    id: "seed-1",
    userName: "Asha K.",
    userEmail: "asha@example.com",
    rating: 5,
    comment:
      "The booking flow is super smooth and the rooms are always clean and ready on time.",
    createdAt: "2026-05-10T09:30:00.000Z",
  },
  {
    id: "seed-2",
    userName: "Mohan P.",
    userEmail: "mohan@example.com",
    rating: 4,
    comment:
      "I love how easy it is to browse rooms and reserve them for team meetings.",
    createdAt: "2026-05-12T13:15:00.000Z",
  },
  {
    id: "seed-3",
    userName: "Priya S.",
    userEmail: "priya@example.com",
    rating: 5,
    comment:
      "The dashboard gives a great overview of upcoming bookings and room availability.",
    createdAt: "2026-05-18T08:45:00.000Z",
  },
];

export const getReviews = () => {
  try {
    const savedReviews = JSON.parse(localStorage.getItem(REVIEWS_KEY) || "[]");
    if (savedReviews.length > 0) {
      return savedReviews;
    }

    saveReviews(seedReviews);
    return seedReviews;
  } catch {
    saveReviews(seedReviews);
    return seedReviews;
  }
};

const getRoomIdByName = (roomName) =>
  roomCatalog.find((room) => room.name === roomName)?.id;

export const normalizeBooking = (booking = {}) => {
  const normalizedRoomId =
    typeof booking.roomId === "string" && roomCatalog.some((room) => room.id === booking.roomId)
      ? booking.roomId
      : getRoomIdByName(booking.roomName) || booking.resourceId || booking.roomId || booking.id;

  const normalizedStatus = booking.status === "CONFIRMED" ? "Confirmed" : booking.status || "Confirmed";

  return {
    id: booking.id,
    roomId: String(normalizedRoomId),
    roomName: booking.roomName || "",
    userName: booking.userName || "",
    userEmail: booking.userEmail || "",
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    purpose: booking.purpose || "",
    status: normalizedStatus,
  };
};

export const saveReviews = (reviews) => {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
};

export const getAverageReview = (reviews = []) => {
  if (!reviews.length) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return total / reviews.length;
};

export const getFormattedDate = (dateString) =>
  new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const getRoomStatus = (roomId, bookings = []) => {
  const roomStatusOverrides = getRoomStatusOverrides();

  if (roomStatusOverrides[roomId]) {
    return roomStatusOverrides[roomId];
  }

  const maintenanceRooms = getMaintenanceRooms();
  if (maintenanceRooms.includes(roomId)) {
    return "Maintenance";
  }

  const today = new Date();
  const upcoming = bookings.some((booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.endTime}:00`);
    return booking.roomId === roomId && bookingDate >= today;
  });

  return upcoming ? "Booked" : "Available";
};

export const getRoomBookingDetails = (roomId, bookings = []) => {
  const now = new Date();

  return bookings
    .filter((booking) => booking.roomId === roomId)
    .filter((booking) => new Date(`${booking.date}T${booking.endTime}:00`) >= now)
    .sort((a, b) => new Date(`${a.date}T${a.startTime}:00`) - new Date(`${b.date}T${b.startTime}:00`))[0];
};

export const getUserBookings = (userEmail, bookings = []) =>
  bookings.filter((booking) => booking.userEmail === userEmail);

export const getUpcomingUserBookings = (userEmail, bookings = []) => {
  const today = new Date();
  return getUserBookings(userEmail, bookings)
    .filter((booking) => new Date(`${booking.date}T${booking.endTime}:00`) >= today)
    .sort((a, b) => new Date(`${a.date}T${a.startTime}:00`) - new Date(`${b.date}T${b.startTime}:00`));
};

export const hasTimeConflict = (roomId, date, startTime, endTime, bookings = []) => {
  const start = new Date(`${date}T${startTime}:00`);
  const end = new Date(`${date}T${endTime}:00`);

  return bookings.some((booking) => {
    if (booking.roomId !== roomId || booking.date !== date) {
      return false;
    }

    const bookingStart = new Date(`${booking.date}T${booking.startTime}:00`);
    const bookingEnd = new Date(`${booking.date}T${booking.endTime}:00`);

    return start < bookingEnd && end > bookingStart;
  });
};
