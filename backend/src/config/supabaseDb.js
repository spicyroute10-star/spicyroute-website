import { supabase } from './supabase.js';

// Database operations using Supabase instead of Prisma
export const db = {
  user: {
    findFirst: async (where) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .match(where)
        .single();
      
      if (error) throw error;
      return data;
    },
    findUnique: async (where) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .match(where)
        .single();
      
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: user, error } = await supabase
        .from('users')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return user;
    },
    update: async (args) => {
      const { data: user, error } = await supabase
        .from('users')
        .update(args.data)
        .match(args.where)
        .select()
        .single();
      
      if (error) throw error;
      return user;
    }
  },
  restaurant: {
    findMany: async (args) => {
      let query = supabase.from('restaurants').select('*');
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: restaurant, error } = await supabase
        .from('restaurants')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return restaurant;
    }
  },
  menuItem: {
    findMany: async (args) => {
      let query = supabase.from('menu_items').select('*');
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  },
  order: {
    create: async (data) => {
      const { data: order, error } = await supabase
        .from('orders')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return order;
    },
    findMany: async (args) => {
      let query = supabase.from('orders').select('*');
      
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      
      if (args?.orderBy) {
        query = query.order(args.orderBy[0], { ascending: args.orderBy[1] === 'asc' });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    update: async (args) => {
      const { data: order, error } = await supabase
        .from('orders')
        .update(args.data)
        .match(args.where)
        .select()
        .single();
      
      if (error) throw error;
      return order;
    }
  }
};

export default db;