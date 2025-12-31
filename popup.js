/* eslint-disable max-classes-per-file */
/* global document chrome */

import createCalendarLinkFromText from './createCalendarLinkFromText.js';

/**
 * CalendarView
 *
 * Responsible for rendering the popup state in the DOM.
 * Does not handle business logic or async operations.
 */
class CalendarView {
  constructor() {
    this.statusEl = document.getElementById('status');
    this.calendarUrlEl = document.getElementById('calendarUrl');
    this.errorEl = document.getElementById('error');

    // Open calendar links in new tab
    this.calendarUrlEl.addEventListener('click', (event) => {
      event.preventDefault();
      if (this.calendarUrlEl.href && this.calendarUrlEl.href !== '#') {
        chrome.tabs.create({ url: this.calendarUrlEl.href });
      }
    });
  }

  render(state) {
    this.#clear();

    switch (state.status) {
      case 'loading':
        this.statusEl.textContent = 'Loading. Please wait...';
        break;
      case 'success':
        this.statusEl.textContent = 'Success!';
        this.calendarUrlEl.textContent = 'Google Calendar URL';
        this.calendarUrlEl.href = state.calendarUrl;
        break;
      case 'error':
        this.errorEl.textContent = state.error;
        break;
      default:
        // idle: already cleared
        break;
    }
  }

  #clear() {
    this.statusEl.textContent = '';
    this.calendarUrlEl.textContent = '';
    this.calendarUrlEl.href = '#';
    this.errorEl.textContent = '';
  }
}

/**
 * CalendarController
 *
 * Orchestrates the flow: listens for user actions, updates state,
 * calls createCalendarLinkFromText, and tells CalendarView to render.
 */
class CalendarController {
  constructor() {
    this.state = {
      status: 'idle',
      calendarUrl: null,
      error: null,
    };

    this.view = new CalendarView();

    this.testButton = document.getElementById('testButton');
  }

  init() {
    if (this.testButton) {
      this.testButton.addEventListener('click', () => this.handleClick());
    }

    // Render initial state
    this.render();

    // Watch chrome.storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.status) {
        chrome.storage.local.get(['status', 'calendarUrl', 'error'])
          .then((data) => this.setState(data));
      }
    });

    // Initial render from storage
    chrome.storage.local.get(['status', 'calendarUrl', 'error'])
      .then((data) => this.setState(data));
  }

  async handleClick() {
    this.setState({ status: 'loading' });

    const text = "LS Women's Group | Fundamentals at Work | Sunday, December 21st | 2PM ET / 11AM PT / 8PM CET";

    try {
      const url = await createCalendarLinkFromText(text);
      this.setState({ status: 'success', calendarUrl: url });
    } catch (err) {
      this.setState({ status: 'error', error: err.message });
    }
  }

  setState(next) {
    this.state = { ...this.state, ...next };
    this.render();
  }

  render() {
    this.view.render(this.state);
  }
}

new CalendarController().init();
