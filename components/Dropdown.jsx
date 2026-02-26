"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

export default function Dropdown({ 
  options = [], 
  value = "", 
  onChange, 
  placeholder = "Select...", 
  isWhite = false,
  className = "" 
}) {
  const selectedOption = options.find(opt => 
    typeof opt === 'object' ? opt.value === value : opt === value
  );

  const displayLabel = selectedOption 
    ? (typeof selectedOption === 'object' ? selectedOption.label : selectedOption)
    : placeholder;

  const bgClass = isWhite 
    ? "bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-50" 
    : "bg-[var(--input-bg)] border-[var(--glass-border)] text-white hover:bg-white/5";

  const menuBgClass = isWhite
    ? "bg-white border-neutral-100 shadow-xl"
    : "bg-[#161616] border-[var(--glass-border)] shadow-2xl backdrop-blur-xl";

  const itemClass = (active) => `
    block w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer
    ${active 
      ? (isWhite ? "bg-neutral-100 text-neutral-900" : "bg-white/10 text-white") 
      : (isWhite ? "text-neutral-700" : "text-neutral-400")}
  `;

  return (
    <Menu as="div" className={`relative inline-block text-left w-full ${className}`}>
      <MenuButton className={`inline-flex w-full items-center justify-between gap-x-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all focus:outline-none ${bgClass}`}>
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon aria-hidden="true" className={`-mr-1 h-5 w-5 transition-transform ui-open:rotate-180 ${isWhite ? "text-neutral-400" : "text-neutral-500"}`} />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className={`absolute left-0 z-50 mt-2 w-full origin-top-left rounded-lg border p-1 focus:outline-none ${menuBgClass}`}>
          <div className="py-1">
            {options.map((option, idx) => {
              const optValue = typeof option === 'object' ? option.value : option;
              const optLabel = typeof option === 'object' ? option.label : option;
              
              return (
                <MenuItem key={idx}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => onChange({ target: { name, value: optValue } })}
                      className={itemClass(active)}
                    >
                      {optLabel}
                    </button>
                  )}
                </MenuItem>
              );
            })}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
