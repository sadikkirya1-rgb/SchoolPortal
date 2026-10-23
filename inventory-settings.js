const inventoryOptionDefinitions = {
    category: [
        'ICT & Electronics', 'Furniture', 'Books & Learning Materials',
        'Sports Equipment', 'Science Laboratory', 'Office Supplies',
        'Cleaning Supplies', 'Medical / Infirmary', 'Transport',
        'Kitchen & Catering', 'Security', 'Maintenance', 'Uniforms & Clothing', 'Other'
    ],
    fundingSource: ['School Budget', 'Government Grant', 'Donation', 'Parent Association', 'Project Fund', 'Other'],
    assignmentStatus: ['In Store', 'Assigned', 'Issued', 'On Loan', 'Under Maintenance', 'Disposed']
};
let inventorySettingsRecords = [];
let inventorySettingsSubscription;
const inventorySettingsListeners = new Set();
const initializedInventoryModules = new WeakSet();

function inventoryDefaultOptionId(optionType, index) {
    return `inventory-option-${optionType}-default-${index}`;
}

function subscribeToInventorySettings(listener) {
    inventorySettingsListeners.add(listener);
    if (!inventorySettingsSubscription) {
        const api = window.schoolPortalData;
        if (!api?.subscribe) return Promise.reject(new Error('School data services are unavailable.'));
        inventorySettingsSubscription = api.subscribe('inventorySettings', records => {
            inventorySettingsRecords = records;
            inventorySettingsListeners.forEach(callback => callback(records));
        }).catch(error => {
            inventorySettingsSubscription = null;
            throw error;
        });
    }
    return inventorySettingsSubscription.then(() => listener(inventorySettingsRecords));
}

function applyInventorySettingsToModule(module, records) {
    for (const optionType of ['category', 'fundingSource', 'assignmentStatus']) {
        const field = optionType === 'category' ? 'category' : optionType;
        const select = module.querySelector(`[data-inv-field="${field}"]`);
        if (!select) continue;
        const defaults = inventoryOptionDefinitions[optionType] || [];
        const settings = records.filter(record => record.optionType === optionType);
        const settingsById = new Map(settings.map(record => [record.id, record]));
        const defaultIds = new Set();
        const values = defaults.map((name, index) => {
            const id = inventoryDefaultOptionId(optionType, index);
            defaultIds.add(id);
            const saved = settingsById.get(id);
            return {
                name: String(saved?.name || name),
                active: saved?.active !== false
            };
        });
        settings.forEach(record => {
            if (!defaultIds.has(record.id) && record.name) {
                values.push({ name: String(record.name), active: record.active !== false });
            }
        });
        const selected = select.value;
        const wasInitialized = initializedInventoryModules.has(module);
        if (selected && !values.some(option => option.name === selected)
            && (!defaults.includes(selected) || wasInitialized)) {
            values.push({ name: selected, active: !defaults.includes(selected) });
        }
        const activeOptions = values.filter(option => option.active);
        select.replaceChildren(
            new Option('Select an option', ''),
            ...values.map(option => {
                const element = new Option(option.name, option.name);
                element.disabled = !option.active;
                return element;
            })
        );
        const selectedOption = values.find(option => option.name === selected);
        select.value = selectedOption && (selectedOption.active || wasInitialized)
            ? selected
            : activeOptions[0]?.name || '';
    }
    initializedInventoryModules.add(module);
}

function applyInventoryDepartmentOptions(module, category) {
    const departmentSelect = module.querySelector('[data-inv-field="department"]');
    const locationSelect = module.querySelector('[data-inv-field="location"]');
    if (!departmentSelect || !locationSelect) return;
    const groups = [...document.querySelectorAll('.sidebar > .menu-title[data-access-section]')].map(title => {
        const label = title.cloneNode(true);
        label.querySelectorAll('i, .approval-group-count').forEach(icon => icon.remove());
        return {
            value: title.dataset.accessSection,
            label: label.textContent.trim(),
            sections: [...(title.nextElementSibling?.querySelectorAll(':scope > li a span') || [])]
                .map(span => span.textContent.trim())
                .filter(Boolean)
        };
    });
    const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const preferredGroup = groups.find(group =>
        normalize(group.value) === normalize(category)
        || normalize(group.label) === normalize(category)
    ) || groups.find(group => normalize(group.label) === 'operations');
    const originalDepartment = departmentSelect.value;
    const selectedGroup = groups.find(group =>
        group.value === originalDepartment || group.label === originalDepartment
    );
    departmentSelect.replaceChildren(
        new Option('Select department', ''),
        ...groups.map(group => new Option(group.label, group.value))
    );
    departmentSelect.value = selectedGroup?.value || preferredGroup?.value || '';

    const fillLocationOptions = (preferredLocation, preserveCurrent = false) => {
        const currentLocation = preserveCurrent ? locationSelect.value : '';
        const group = groups.find(item => item.value === departmentSelect.value);
        const sections = group?.sections || [];
        const options = [...sections];
        if (currentLocation && !options.includes(currentLocation)) options.push(currentLocation);
        if (preferredLocation && !options.includes(preferredLocation)) options.push(preferredLocation);
        locationSelect.replaceChildren(
            new Option('Select section', ''),
            ...options.map(section => new Option(section, section))
        );
        locationSelect.value = options.includes(preferredLocation)
            ? preferredLocation
            : options.includes(currentLocation) ? currentLocation : '';
    };
    fillLocationOptions('Inventory');
    departmentSelect.addEventListener('change', () => fillLocationOptions(''));

    module.querySelector('[data-inv-table]')?.addEventListener('click', event => {
        const editButton = event.target.closest('[data-action="edit"]');
        if (!editButton) return;
        let records = [];
        try {
            const parsed = JSON.parse(localStorage.getItem('schoolInventoryRecords') || '[]');
            if (Array.isArray(parsed)) records = parsed;
        } catch (error) {
            console.error('Unable to read the inventory record being edited.', error);
        }
        const record = records[Number(editButton.dataset.index)];
        if (!record) return;
        ['category', 'fundingSource', 'assignmentStatus'].forEach(field => {
            const select = module.querySelector(`[data-inv-field="${field}"]`);
            const value = String(record[field] || '');
            if (!select || !value || [...select.options].some(option => option.value === value)) return;
            const legacyOption = new Option(value, value);
            legacyOption.disabled = true;
            select.add(legacyOption);
            select.value = value;
        });
        if (record.department && ![...departmentSelect.options].some(option => option.value === record.department)) {
            departmentSelect.add(new Option(record.department, record.department));
        }
        departmentSelect.value = record.department || '';
        fillLocationOptions(record.location || '', true);
    });
}

function createInventorySettingsModule(optionType) {
    const definitions = {
        category: {
            title: 'Inventory Categories',
            fieldLabel: 'Category name',
            defaults: [
                'ICT & Electronics', 'Furniture', 'Books & Learning Materials',
                'Sports Equipment', 'Science Laboratory', 'Office Supplies',
                'Cleaning Supplies', 'Medical / Infirmary', 'Transport',
                'Kitchen & Catering', 'Security', 'Maintenance', 'Uniforms & Clothing', 'Other'
            ]
        },
        fundingSource: {
            title: 'Funding Sources',
            fieldLabel: 'Funding source',
            defaults: ['School Budget', 'Government Grant', 'Donation', 'Parent Association', 'Project Fund', 'Other']
        },
        assignmentStatus: {
            title: 'Assignment Statuses',
            fieldLabel: 'Assignment status',
            defaults: ['In Store', 'Assigned', 'Issued', 'On Loan', 'Under Maintenance', 'Disposed']
        }
    };
    const definition = definitions[optionType];
    if (!definition) throw new Error(`Unsupported inventory setting: ${optionType}`);

    const section = document.createElement('section');
    section.className = 'module inventory-settings-module';
    section.id = `inventorySettings-${optionType}`;
    const q = selector => section.querySelector(selector);
    const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[char]);
    let records = [];
    let editingId = '';

    section.innerHTML = `
        <header class="inventory-settings-header">
            <div>
                <h2>${escape(definition.title)}</h2>
                <p>Manage the options available in Inventory Item Registration.</p>
            </div>
        </header>
        <div class="inventory-settings-layout">
            <form class="inventory-settings-form" data-is-form>
                <h3 data-is-form-title>Add ${escape(definition.fieldLabel)}</h3>
                <label for="inventorySettingName-${optionType}">${escape(definition.fieldLabel)}</label>
                <input id="inventorySettingName-${optionType}" name="name" type="text" maxlength="80" required>
                <div class="inventory-settings-form-actions">
                    <button class="inventory-btn inventory-btn-light" type="button" data-is-reset>Clear</button>
                    <button class="inventory-btn inventory-btn-primary" type="submit" data-is-save>Save</button>
                </div>
                <p class="inventory-settings-message" data-is-message role="status" aria-live="polite"></p>
            </form>
            <div class="inventory-settings-table-card">
                <div class="inventory-settings-table-heading">
                    <div>
                        <h3>${escape(definition.title)}</h3>
                        <p>Default options can be renamed or deactivated.</p>
                    </div>
                    <input class="inventory-search" type="search" placeholder="Search options" aria-label="Search options" data-is-search>
                </div>
                <div class="inventory-settings-table-wrap">
                    <table class="inventory-settings-table">
                        <thead><tr><th>${escape(definition.fieldLabel)}</th><th>Source</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody data-is-table></tbody>
                    </table>
                    <p class="inventory-settings-empty" data-is-empty>No options found.</p>
                </div>
            </div>
        </div>`;

    const defaultId = index => inventoryDefaultOptionId(optionType, index);
    const allRows = () => {
        const savedById = new Map(records
            .filter(record => record.optionType === optionType)
            .map(record => [record.id, record]));
        const defaultIds = new Set();
        const defaults = definition.defaults.map((name, index) => {
            const id = defaultId(index);
            defaultIds.add(id);
            return { id, name, active: true, isDefault: true, ...savedById.get(id) };
        });
        const custom = records
            .filter(record => record.optionType === optionType && !defaultIds.has(record.id))
            .map(record => ({ ...record, isDefault: false }));
        return [...defaults, ...custom].sort((left, right) =>
            String(left.name).localeCompare(String(right.name))
        );
    };
    const render = () => {
        const search = q('[data-is-search]').value.trim().toLowerCase();
        const rows = allRows().filter(row => String(row.name || '').toLowerCase().includes(search));
        q('[data-is-table]').innerHTML = rows.map(row => `
            <tr>
                <td>${escape(row.name)}</td>
                <td>${row.isDefault ? 'Default' : 'Custom'}</td>
                <td><span class="inventory-settings-status ${row.active === false ? 'is-inactive' : ''}">${row.active === false ? 'Inactive' : 'Active'}</span></td>
                <td><div class="inventory-settings-actions">
                    <button class="inventory-action inventory-edit" type="button" data-is-edit="${escape(row.id)}" ${canEdit ? '' : 'disabled'}>Edit</button>
                    <button class="inventory-action ${row.active === false ? 'inventory-view' : 'inventory-delete'}" type="button" data-is-toggle="${escape(row.id)}" ${canEdit ? '' : 'disabled'}>${row.active === false ? 'Activate' : 'Deactivate'}</button>
                </div></td>
            </tr>`).join('');
        q('[data-is-empty]').hidden = rows.length > 0;
    };
    const reset = () => {
        editingId = '';
        q('[data-is-form]').reset();
        q('[data-is-form-title]').textContent = `Add ${definition.fieldLabel}`;
        q('[data-is-save]').textContent = 'Save';
    };
    const save = async event => {
        event.preventDefault();
        const name = q('[data-is-form]').elements.name.value.trim();
        if (!name) return;
        const duplicate = allRows().some(row =>
            row.id !== editingId
            && row.active !== false
            && String(row.name).trim().toLowerCase() === name.toLowerCase()
        );
        if (duplicate) {
            q('[data-is-message]').textContent = 'An active option with that name already exists.';
            return;
        }
        const previous = allRows().find(row => row.id === editingId);
        const recordId = editingId || `inventory-option-${optionType}-${crypto.randomUUID()}`;
        try {
            await window.schoolPortalData.saveRecord('inventorySettings', recordId, {
                optionType,
                name,
                active: previous?.active !== false,
                updatedAt: new Date().toISOString()
            });
            q('[data-is-message]').textContent = 'Option saved.';
            reset();
        } catch (error) {
            console.error(`Unable to save the ${definition.fieldLabel.toLowerCase()}.`, error);
            q('[data-is-message]').textContent = error.message || 'Unable to save the option.';
        }
    };
    const tableClick = async event => {
        const editButton = event.target.closest('[data-is-edit]');
        const toggleButton = event.target.closest('[data-is-toggle]');
        if (editButton) {
            const row = allRows().find(item => item.id === editButton.dataset.isEdit);
            if (!row) return;
            editingId = row.id;
            q('[data-is-form]').elements.name.value = row.name;
            q('[data-is-form-title]').textContent = `Edit ${definition.fieldLabel}`;
            q('[data-is-save]').textContent = 'Update';
            q('[data-is-message]').textContent = '';
        } else if (toggleButton) {
            const row = allRows().find(item => item.id === toggleButton.dataset.isToggle);
            if (!row) return;
            try {
                await window.schoolPortalData.saveRecord('inventorySettings', row.id, {
                    optionType,
                    name: row.name,
                    active: row.active === false,
                    updatedAt: new Date().toISOString()
                });
                q('[data-is-message]').textContent = `Option ${row.active === false ? 'activated' : 'deactivated'}.`;
            } catch (error) {
                console.error(`Unable to update the ${definition.fieldLabel.toLowerCase()} status.`, error);
                q('[data-is-message]').textContent = error.message || 'Unable to update the option.';
            }
        }
    };

    const identity = window.schoolPortalData?.getIdentity?.();
    const canEdit = ['schoolAdmin', 'superAdmin', 'director', 'headTeacher'].includes(identity?.role)
        || identity?.permissions?.inventory?.edit === true;
    q('[data-is-form]').querySelectorAll('input,button').forEach(control => {
        control.disabled = !canEdit;
    });
    q('[data-is-form]').addEventListener('submit', save);
    q('[data-is-reset]').addEventListener('click', reset);
    q('[data-is-search]').addEventListener('input', render);
    q('[data-is-table]').addEventListener('click', tableClick);
    if (!canEdit) q('[data-is-message]').textContent = 'You have view-only access to inventory settings.';

    const api = window.schoolPortalData;
    if (!api?.subscribe || !api?.saveRecord) {
        q('[data-is-message]').textContent = 'School data services are unavailable. Reload the page and try again.';
    } else {
        subscribeToInventorySettings(nextRecords => {
            records = nextRecords;
            render();
        }).catch(error => {
            console.error(`Unable to load ${definition.title.toLowerCase()}.`, error);
            q('[data-is-message]').textContent = error.message || 'Unable to load inventory settings.';
        });
    }
    render();
    return section;
}

window.createInventorySettingsModule = createInventorySettingsModule;

const originalInventoryModuleFactory = window.createInventoryModule;
if (typeof originalInventoryModuleFactory === 'function') {
    window.createInventoryModule = category => {
        const module = originalInventoryModuleFactory(category);
        applyInventoryDepartmentOptions(module, category);
        subscribeToInventorySettings(records => applyInventorySettingsToModule(module, records)).catch(error => {
            console.error('Unable to load shared inventory dropdown options.', error);
            const toast = module.querySelector('[data-inv-toast]');
            if (toast) {
                toast.textContent = 'Unable to load shared inventory options.';
                toast.classList.add('show');
            }
        });
        return module;
    };
}
