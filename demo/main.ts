// The kit's demo: every component on one page, to see them and test them.
import '../src/theme.css';
import '../src/admin.css';
import { mount } from 'svelte';
import Demo from './Demo.svelte';

mount(Demo, { target: document.getElementById('app')! });
