let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`⚡ Client connected to Socket.io [ID: ${socket.id}]`);

    // Join room based on role or resource
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`👤 Socket ${socket.id} joined admin_room`);
    });

    socket.on('join_vendor_room', (restaurantId) => {
      if (restaurantId) {
        const roomName = `restaurant_${restaurantId}`;
        socket.join(roomName);
        console.log(`🏬 Socket ${socket.id} joined ${roomName}`);
      }
    });

    socket.on('join_order_room', (orderId) => {
      if (orderId) {
        const roomName = `order_${orderId}`;
        socket.join(roomName);
        console.log(`📦 Socket ${socket.id} joined ${roomName}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected [ID: ${socket.id}]`);
    });
  });
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized!');
  }
  return ioInstance;
};

/**
 * Emit new order created notification
 */
export const notifyOrderCreated = (order) => {
  if (!ioInstance) return;

  const restId = String(order.restaurantId);
  console.log(`📡 Emitting new_order to room restaurant_${restId}`);

  // Notify vendor room
  ioInstance.to(`restaurant_${restId}`).emit('new_order', order);

  // Broadcast fallback for vendors
  ioInstance.emit('global_vendor_new_order', order);

  // Notify admin dashboard
  ioInstance.to('admin_room').emit('order_created_admin', order);
};

/**
 * Emit order status update notification
 */
export const notifyOrderStatusUpdated = (order) => {
  if (!ioInstance) return;

  // Notify customer tracking
  ioInstance.to(`order_${order.id}`).emit('order_status_changed', order);

  // Notify vendor room
  ioInstance.to(`restaurant_${order.restaurantId}`).emit('order_updated_vendor', order);

  // Notify admin dashboard
  ioInstance.to('admin_room').emit('order_updated_admin', order);
};
