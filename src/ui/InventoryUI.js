/**
 * 背包UI
 */
import { Inventory } from '../game/Inventory.js';

export class InventoryUI {
    constructor(container, inventory, onUseItem, onDeleteItem) {
        this.container = container;
        this.inventory = inventory;
        this.onUseItem = onUseItem;
        this.onDeleteItem = onDeleteItem;
        this.isOpen = false;
        this.contextMenu = null;
        this.selectedItemIndex = -1;
        this.init();
    }

    init() {
        this.render();
        this.attachEvents();
    }

    render() {
        const items = this.inventory.getItems();
        const slots = [];

        for (let i = 0; i < this.inventory.maxSlots; i++) {
            if (i < items.length) {
                const item = items[i];
                slots.push(`
                    <div class="inventory-slot inventory-item ${item.used ? 'used' : ''}" 
                         data-index="${i}">
                        <span class="item-icon">${item.getIcon()}</span>
                        <span class="item-name">${item.name}</span>
                    </div>
                `);
            } else {
                slots.push('<div class="inventory-slot empty-slot"></div>');
            }
        }

        this.container.innerHTML = `
            <div class="inventory-header">
                <h3>背包 (${items.length}/${this.inventory.maxSlots})</h3>
                <button class="close-inventory">×</button>
            </div>
            <div class="inventory-items">
                ${slots.join('')}
            </div>
        `;

        this.attachSlotEvents();
    }

    attachEvents() {
        const closeBtn = this.container.querySelector('.close-inventory');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.toggle();
            });
        }
    }

    attachSlotEvents() {
        const slots = this.container.querySelectorAll('.inventory-item');
        slots.forEach(slot => {
            const index = parseInt(slot.getAttribute('data-index'));
            const item = this.inventory.getItem(index);

            if (item && !item.used) {
                // 右键菜单
                slot.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.showContextMenu(e, index);
                });

                // 左键使用
                slot.addEventListener('click', () => {
                    this.useItem(index);
                });
            }
        });
    }

    showContextMenu(event, itemIndex) {
        this.closeContextMenu();

        const item = this.inventory.getItem(itemIndex);
        if (!item || item.used) return;

        this.selectedItemIndex = itemIndex;

        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
        this.contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="use">使用</div>
            <div class="context-menu-item" data-action="delete">删除</div>
        `;

        this.contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action === 'use') {
                    this.useItem(itemIndex);
                } else if (action === 'delete') {
                    this.deleteItem(itemIndex);
                }
                this.closeContextMenu();
            });
        });

        document.body.appendChild(this.contextMenu);

        setTimeout(() => {
            document.addEventListener('click', () => this.closeContextMenu(), { once: true });
            document.addEventListener('contextmenu', () => this.closeContextMenu(), { once: true });
        }, 10);
    }

    closeContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
        this.selectedItemIndex = -1;
    }

    useItem(index) {
        if (this.onUseItem) {
            this.onUseItem(index);
        }
        this.update();
    }

    deleteItem(index) {
        if (this.onDeleteItem) {
            this.onDeleteItem(index);
        }
        this.update();
    }

    update() {
        this.render();
    }

    toggle() {
        this.isOpen = !this.isOpen;
        this.container.style.display = this.isOpen ? 'block' : 'none';
        return this.isOpen;
    }

    show() {
        this.isOpen = true;
        this.container.style.display = 'block';
    }

    hide() {
        this.isOpen = false;
        this.container.style.display = 'none';
    }

    isInventoryOpen() {
        return this.isOpen;
    }

    dispose() {
        this.closeContextMenu();
        this.container.innerHTML = '';
    }
}

