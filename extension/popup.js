/* eslint-disable max-classes-per-file */
/* global document chrome */

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
 * Orchestrates the flow: manages state and tells CalendarView to render.
 * Listens for chrome.storage changes and updates the view accordingly.
 */
class CalendarController {
  constructor() {
    this.state = {
      status: 'idle',
      calendarUrl: null,
      error: null,
    };

    this.view = new CalendarView();
  }

  init() {
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

  setState(next) {
    this.state = { ...this.state, ...next };
    this.render();
  }

  render() {
    this.view.render(this.state);
  }
}

new CalendarController().init();
