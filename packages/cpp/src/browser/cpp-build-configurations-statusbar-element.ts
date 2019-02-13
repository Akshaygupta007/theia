/********************************************************************************
 * Copyright (C) 2018-2019 Ericsson
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { injectable, inject } from 'inversify';
import { StatusBar, StatusBarAlignment } from '@theia/core/lib/browser';
import { CppBuildConfigurationManager, CppBuildConfiguration } from './cpp-build-configurations';
import { CPP_CHANGE_BUILD_CONFIGURATION } from './cpp-build-configurations-ui';
import { CppPreferences } from './cpp-preferences';

@injectable()
export class CppBuildConfigurationsStatusBarElement {

    @inject(CppPreferences)
    protected readonly cppPreferences: CppPreferences;

    @inject(CppBuildConfigurationManager)
    protected readonly cppManager: CppBuildConfigurationManager;

    @inject(StatusBar)
    protected readonly statusBar: StatusBar;

    protected readonly cppIdentifier = 'cpp-configurator';

    /**
     * Display the `CppBuildConfiguration` statusbar element,
     * and listen to updates to the active build configuration, and settings.
     */
    show(): void {
        this.setCppBuildConfigElement();
        this.cppManager.onActiveConfigChange(() => this.setCppBuildConfigElement());
        this.cppPreferences.onPreferenceChanged(() => {
            this.handleConfigUpdate();
            this.setCppBuildConfigElement();
        });
    }

    /**
     * Set the statusbar element used to create, set, and update
     * the list of `CppBuildConfiuration` for a workspace.
     */
    protected setCppBuildConfigElement(): void {
        const activeConfig = this.cppManager.getActiveConfig();
        this.statusBar.setElement(this.cppIdentifier, {
            text: `$(wrench) C/C++ Build Config ${(activeConfig) ? activeConfig.name : ''}`,
            alignment: StatusBarAlignment.RIGHT,
            command: CPP_CHANGE_BUILD_CONFIGURATION.id,
            priority: 0.5,
        });
    }

    /**
     * Update the active `CppBuildConfiguration` if it is no longer valid.
     */
    protected handleConfigUpdate(): void {
        const activeConfig = this.cppManager.getActiveConfig();
        const valid = (activeConfig)
            ? this.cppManager.getValidConfigs().some(a => this.equals(a, activeConfig))
            : false;
        if (!valid) {
            this.cppManager.setActiveConfig(undefined);
        }
    }

    /**
     * Determine if two `CppBuildConfiguration` are equal.
     *
     * @param a `CppBuildConfiguration`.
     * @param b `CppBuildConfiguration`.
     */
    protected equals(a: CppBuildConfiguration, b: CppBuildConfiguration): boolean {
        return a.name === b.name && a.directory === b.directory && a.directory === b.directory;
    }

}
