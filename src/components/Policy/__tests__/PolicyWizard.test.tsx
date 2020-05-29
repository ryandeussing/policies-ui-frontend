import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { PolicyWizard } from '../PolicyWizard';
import userEvent from '@testing-library/user-event';

jest.mock('../../../utils/Insights');
jest.mock('../../../hooks/useUrlState');

describe('src/components/Policy/PolicyWizard', () => {

    it('Title is "Create a Policy" when not editing', async () => {
        jest.useFakeTimers();
        render(
            <PolicyWizard
                initialValue={ {} }
                onClose={ jest.fn() }
                onSave={ jest.fn() }
                onVerify={ jest.fn() }
                onValidateName={ jest.fn() }
                isLoading={ false }
                showCreateStep={ true }
                isEditing={ false }
            />
        );

        await act(async () => {
            await jest.runAllTimers();
        });

        const title = screen.getByRole('heading', { name: /Create a policy/i });
        expect(title).toBeTruthy();
        expect(title.id.startsWith('pf-wizard-title-')).toBeTruthy();
    });

    it('Title is "Edit a policy" when editing', async () => {
        jest.useFakeTimers();
        render(
            <PolicyWizard
                initialValue={ {} }
                onClose={ jest.fn() }
                onSave={ jest.fn() }
                onVerify={ jest.fn() }
                onValidateName={ jest.fn() }
                isLoading={ false }
                showCreateStep={ true }
                isEditing={ true }
            />
        );

        await act(async () => {
            await jest.runAllTimers();
        });

        const title = screen.getByRole('heading', { name: /Edit a policy/i });
        expect(title).toBeTruthy();
        expect(title.id.startsWith('pf-wizard-title-')).toBeTruthy();
    });

    it('First step is "Create policy" when showCreateStep is true', async () => {
        jest.useFakeTimers();
        render(
            <PolicyWizard
                initialValue={ {} }
                onClose={ jest.fn() }
                onSave={ jest.fn() }
                onVerify={ jest.fn() }
                onValidateName={ jest.fn() }
                isLoading={ false }
                showCreateStep={ true }
                isEditing={ false }
            />
        );

        await act(async () => {
            await jest.runAllTimers();
        });

        const title = screen.getByText('Create Policy', {
            selector: 'h4'
        });

        expect(title).toBeTruthy();
        expect(title.className.includes('pf-c-title')).toBeTruthy();
    });

    it('First step is "Policy Details" when showCreateStep is false and "Create Policy" does not appear', async () => {
        jest.useFakeTimers();
        render(
            <PolicyWizard
                initialValue={ {} }
                onClose={ jest.fn() }
                onSave={ jest.fn() }
                onVerify={ jest.fn() }
                onValidateName={ jest.fn() }
                isLoading={ false }
                showCreateStep={ false }
                isEditing={ false }
            />
        );

        await act(async () => {
            await jest.runAllTimers();
        });

        const createPolicyTitle = screen.queryByText('Create Policy', {
            selector: 'h4'
        });

        expect(createPolicyTitle).toBeFalsy();

        const policyDetailsTitle = screen.getByText('Policy Details', {
            selector: 'h4'
        });

        expect(policyDetailsTitle).toBeTruthy();
        expect(policyDetailsTitle.className.includes('pf-c-title')).toBeTruthy();

    });

    describe('Policy Details', () => {
        it('Next is disabled when no name is set', async () => {
            jest.useFakeTimers();
            render(
                <PolicyWizard
                    initialValue={ {} }
                    onClose={ jest.fn() }
                    onSave={ jest.fn() }
                    onVerify={ jest.fn() }
                    onValidateName={ jest.fn() }
                    isLoading={ false }
                    showCreateStep={ false }
                    isEditing={ false }
                />
            );

            await act(async () => {
                await jest.runAllTimers();
            });

            expect(screen.getByText(/next/i)).toBeDisabled();
        });

        it('Next is enabled when name is set', async () => {
            jest.useFakeTimers();
            render(
                <PolicyWizard
                    initialValue={ {} }
                    onClose={ jest.fn() }
                    onSave={ jest.fn() }
                    onVerify={ jest.fn() }
                    onValidateName={ jest.fn() }
                    isLoading={ false }
                    showCreateStep={ false }
                    isEditing={ false }
                />
            );

            await act(async () => {
                await jest.runAllTimers();
            });

            await act(async () => {
                await userEvent.type(document.getElementById('name') as HTMLInputElement, 'foo');
            });

            expect(screen.getByText(/next/i)).toBeEnabled();
        });

        it('Next will trigger a call to onValidateName', async () => {
            jest.useFakeTimers();
            const onValidateName = jest.fn(() => Promise.resolve({ created: false }));
            render(
                <PolicyWizard
                    initialValue={ {} }
                    onClose={ jest.fn() }
                    onSave={ jest.fn() }
                    onVerify={ jest.fn() }
                    onValidateName={ onValidateName }
                    isLoading={ false }
                    showCreateStep={ false }
                    isEditing={ false }
                />
            );

            await act(async () => {
                await jest.runAllTimers();
            });

            expect(onValidateName).toBeCalledTimes(0);

            await act(async () => {
                await userEvent.type(document.getElementById('name') as HTMLInputElement, 'foo');
            });

            await act(async () => {
                await userEvent.click(screen.getByText(/next/i));
            });

            expect(onValidateName).toBeCalledTimes(1);
        });

        it('Next will move to next page if validate response does not have an error', async () => {
            jest.useFakeTimers();
            const onValidateName = jest.fn(() => Promise.resolve({ created: false }));
            render(
                <PolicyWizard
                    initialValue={ {} }
                    onClose={ jest.fn() }
                    onSave={ jest.fn() }
                    onVerify={ jest.fn() }
                    onValidateName={ onValidateName }
                    isLoading={ false }
                    showCreateStep={ false }
                    isEditing={ false }
                />
            );

            await act(async () => {
                await jest.runAllTimers();
            });

            expect(onValidateName).toBeCalledTimes(0);

            await act(async () => {
                await userEvent.type(document.getElementById('name') as HTMLInputElement, 'foo');
            });

            await act(async () => {
                await userEvent.click(screen.getByText(/next/i));
            });

            const policyDetailsTitle = screen.queryByText('Policy Details', {
                selector: 'h4'
            });
            expect(policyDetailsTitle).toBeFalsy();
            expect(onValidateName).toBeCalledTimes(1);
        });

        it('Next will not move to next page if validate response has an error', async () => {
            jest.useFakeTimers();
            const onValidateName = jest.fn(() => Promise.resolve({ created: false, error: 'invalid name' }));
            render(
                <PolicyWizard
                    initialValue={ {} }
                    onClose={ jest.fn() }
                    onSave={ jest.fn() }
                    onVerify={ jest.fn() }
                    onValidateName={ onValidateName }
                    isLoading={ false }
                    showCreateStep={ false }
                    isEditing={ false }
                />
            );

            await act(async () => {
                await jest.runAllTimers();
            });

            expect(onValidateName).toBeCalledTimes(0);

            await act(async () => {
                await userEvent.type(document.getElementById('name') as HTMLInputElement, 'foo');
            });

            await act(async () => {
                await userEvent.click(screen.getByText(/next/i));
            });

            const policyDetailsTitle = screen.queryByText('Policy Details', {
                selector: 'h4'
            });
            expect(policyDetailsTitle).toBeTruthy();
            expect(onValidateName).toBeCalledTimes(1);
        });
    });

});