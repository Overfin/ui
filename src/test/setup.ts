// Before each component test file: the kit's look (where things are drawn,
// what is hidden, what is in the top layer depends on it), and a clean page
// after each test.
/// <reference types="@vitest/browser-playwright" />
import '../theme.css';
import '../admin.css';
import { afterEach } from 'vitest';
import { cleanup } from './render';

afterEach(cleanup);
