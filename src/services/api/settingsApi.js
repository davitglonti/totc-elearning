import { request } from './httpClient';

export const settingsApi = {
  async get() {
    return request('/settings');
  },

  async update(data) {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const paymentsApi = {
  async createCheckout(courseId, couponCode = null) {
    return request('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ courseId, couponCode }),
    });
  },
};

export const promoCodesApi = {
  async validate(code, amount = 0, courseId = null) {
    return request('/promocodes/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount, courseId }),
    });
  },
};

export const subscriptionsApi = {
  async subscribe(plan = 'Pro', billingCycle = 'monthly', paymentData = {}) {
    const payload = typeof paymentData === 'string'
      ? { plan, billingCycle, paymentMethod: paymentData }
      : { plan, billingCycle, ...paymentData };

    const result = await request('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.user) {
      localStorage.setItem('totc_user', JSON.stringify(result.user));
    }
    return result;
  },

  async cancel() {
    return request('/subscriptions/cancel', {
      method: 'POST',
    });
  },

  async getStatus() {
    return request('/subscriptions/status');
  },
};
