import { supabase } from './supabase.js';

// Export a compatible interface for existing code
export default {
  user: {
    findFirst: async (args) => {
      const { data } = await supabase.from('users').select('*').match(args.where).single();
      return data;
    },
    findUnique: async (args) => {
      const { data } = await supabase.from('users').select('*').match(args.where).single();
      return data;
    },
    create: async (args) => {
      const { data } = await supabase.from('users').insert(args.data).select().single();
      return data;
    },
    update: async (args) => {
      const { data } = await supabase.from('users').update(args.data).match(args.where).select().single();
      return data;
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
      const { data } = await query;
      return data || [];
    },
    findUnique: async (args) => {
      const { data } = await supabase.from('restaurants').select('*').match(args.where).single();
      return data;
    },
    create: async (args) => {
      const { data } = await supabase.from('restaurants').insert(args.data).select().single();
      return data;
    },
    update: async (args) => {
      const { data } = await supabase.from('restaurants').update(args.data).match(args.where).select().single();
      return data;
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
      const { data } = await query;
      return data || [];
    },
    create: async (args) => {
      const { data } = await supabase.from('menu_items').insert(args.data).select().single();
      return data;
    },
    update: async (args) => {
      const { data } = await supabase.from('menu_items').update(args.data).match(args.where).select().single();
      return data;
    },
    delete: async (args) => {
      const { data } = await supabase.from('menu_items').delete().match(args.where).select().single();
      return data;
    }
  },
  order: {
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
      const { data } = await query;
      return data || [];
    },
    findUnique: async (args) => {
      const { data } = await supabase.from('orders').select('*').match(args.where).single();
      return data;
    },
    create: async (args) => {
      const { data } = await supabase.from('orders').insert(args.data).select().single();
      return data;
    },
    update: async (args) => {
      const { data } = await supabase.from('orders').update(args.data).match(args.where).select().single();
      return data;
    }
  },
  orderItem: {
    create: async (args) => {
      const { data } = await supabase.from('order_items').insert(args.data).select().single();
      return data;
    },
    findMany: async (args) => {
      let query = supabase.from('order_items').select('*');
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { data } = await query;
      return data || [];
    }
  },
  deliveryPartner: {
    findMany: async (args) => {
      let query = supabase.from('delivery_partners').select('*');
      if (args?.where) {
        Object.entries(args.where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { data } = await query;
      return data || [];
    },
    create: async (args) => {
      const { data } = await supabase.from('delivery_partners').insert(args.data).select().single();
      return data;
    },
    update: async (args) => {
      const { data } = await supabase.from('delivery_partners').update(args.data).match(args.where).select().single();
      return data;
    }
  },
  platformSetting: {
    findUnique: async (args) => {
      const { data } = await supabase.from('platform_settings').select('*').match(args.where).single();
      return data;
    },
    upsert: async (args) => {
      const { data } = await supabase.from('platform_settings').upsert(args).select().single();
      return data;
    }
  },
  // Helper for restaurants with owner info
  restaurantWithOwner: {
    update: async (args) => {
      const { data } = await supabase
        .from('restaurants')
        .update(args.data)
        .eq('id', parseInt(args.where.id, 10))
        .select()
        .single();
      return data;
    }
  }
};
