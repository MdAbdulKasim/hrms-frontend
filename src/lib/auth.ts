/**
 * Authentication and API utilities for HRMS
 */

// Get the API base URL with proper formatting
export const getApiUrl = (): string => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    // Validate the URL is not empty or "undefined"
    if (!apiUrl || apiUrl === 'undefined') {
        console.error("ERROR: NEXT_PUBLIC_API_URL is not set or is undefined");
        throw new Error("API URL is not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
    }

    // Remove trailing slash if present
    const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    if (typeof window !== 'undefined' && (window as any).DEBUG_AUTH) {
        console.log("DEBUG_API_URL:", cleanUrl);
    }
    return cleanUrl;
};
// Cookie helpers
export const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
    if (typeof document === 'undefined') return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

export const deleteCookie = (name: string): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0`;
};

// Auth token helpers
// Basic JWT Decoder
export const decodeToken = (token: string): any => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const getAuthToken = (): string | null => getCookie('authToken') || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);
export const setAuthToken = (token: string): void => {
    setCookie('authToken', token, 7);
    if (typeof window !== 'undefined') localStorage.setItem('authToken', token);
};

export const getOrgId = (): string | null => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        const fromToken = payload?.orgId ||
            payload?.organizationId ||
            payload?.employee?.organizationId ||
            payload?.employee?.organization?.orgId ||
            payload?.employee?.orgId ||
            payload?.organization?.orgId ||
            payload?.employee?.organization?.id ||
            payload?.organization?.id;
        if (fromToken) return String(fromToken);
    }
    return getCookie('currentOrgId') || (typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null);
};

export const setOrgId = (orgId: string): void => {
    setCookie('currentOrgId', orgId);
    if (typeof window !== 'undefined') localStorage.setItem('currentOrgId', orgId);
};

export const getEmployeeId = (): string | null => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        // JWT uses 'sub' for subject (the employee ID)
        const fromToken = payload?.sub || payload?.employeeId || payload?.employee?.id || payload?.id;
        if (fromToken) return String(fromToken);
    }
    // Fallback to cookie from login response
    return getCookie('hrms_user_id') || (typeof window !== 'undefined' ? localStorage.getItem('hrms_user_id') : null);
};

export const setEmployeeId = (employeeId: string): void => {
    setCookie('hrms_user_id', employeeId);
    if (typeof window !== 'undefined') localStorage.setItem('hrms_user_id', employeeId);
};

export const getLocationId = (): string | null => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        const fromToken = payload?.locationId || payload?.employee?.locationId;
        if (fromToken) return fromToken;
    }
    return getCookie('currentLocationId') || (typeof window !== 'undefined' ? localStorage.getItem('currentLocationId') : null);
};

export const setLocationId = (locationId: string): void => {
    setCookie('currentLocationId', locationId);
    if (typeof window !== 'undefined') localStorage.setItem('currentLocationId', locationId);
};

export const getDepartmentId = (): string | null => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        const fromToken = payload?.departmentId || payload?.employee?.departmentId;
        if (fromToken) return fromToken;
    }
    return getCookie('currentDepartmentId') || (typeof window !== 'undefined' ? localStorage.getItem('currentDepartmentId') : null);
};

// Setup Status Helper
export const checkSetupStatus = (): boolean => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        // Check for various claim names
        if (payload?.setupCompleted || payload?.isSetupCompleted || payload?.organizationSetup) return true;
    }
    // Fallback to cookie or localStorage
    return getCookie('setupCompleted') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('setupCompleted') === 'true');
};

// Employee Profile Setup Status Helper
export const checkEmployeeSetupStatus = (): boolean => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        // Check if employee onboarding is completed
        if (payload?.onboardingStatus === 'completed' || payload?.employeeSetupCompleted) return true;
    }
    // Fallback to cookie or localStorage
    return getCookie('employeeSetupCompleted') === 'true' || (typeof window !== 'undefined' && localStorage.getItem('employeeSetupCompleted') === 'true');
};

/**
 * Returns true if the user of this role MUST complete setup before accessing protected routes.
 * Admins need to complete organization setup, employees need to complete profile setup.
 */
export const requiresSetup = (role: 'admin' | 'employee' | string | null): boolean => {
    if (role === 'admin') {
        return !checkSetupStatus();
    } else if (role === 'employee') {
        return !checkEmployeeSetupStatus();
    }
    return false;
};

// Role Helper
export const getUserRole = (): 'admin' | 'employee' | null => {
    const token = getAuthToken();
    if (token) {
        const payload = decodeToken(token);
        if (payload?.role) return payload.role;
    }
    return (getCookie('role') || (typeof window !== 'undefined' ? localStorage.getItem('role') : null)) as 'admin' | 'employee' | null;
};

export const setDepartmentId = (departmentId: string): void => {
    setCookie('currentDepartmentId', departmentId);
    if (typeof window !== 'undefined') localStorage.setItem('currentDepartmentId', departmentId);
};

// Clear all setup data (for logout)
export const clearSetupData = (): void => {
    deleteCookie('currentOrgId');
    deleteCookie('currentLocationId');
    deleteCookie('currentDepartmentId');
    deleteCookie('setupCompleted');
    deleteCookie('employeeSetupCompleted');
    deleteCookie('organizationSetup');
    deleteCookie('authToken');
    deleteCookie('role');
    deleteCookie('hrms_user_id');
    deleteCookie('hrms_user_email');
    deleteCookie('hrms_user_firstName');
    deleteCookie('hrms_user_lastName');
    deleteCookie('registrationFirstName');
    deleteCookie('registrationLastName');
    deleteCookie('registrationEmail');
    // Clear any localStorage just in case legacy code exists
    if (typeof window !== 'undefined') {
        localStorage.clear();
    }
};

// Sync setup state from backend
export const syncSetupState = async (token: string, orgId?: string): Promise<boolean> => {
    if (!orgId || typeof window === 'undefined') return false;

    try {
        const apiUrl = getApiUrl();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.warn(`SYNC_START: Checking setup for Org: ${orgId}`);

        // Helper to check array in various response shapes
        const hasItems = (data: any, label: string): boolean => {
            if (!data) {
                console.warn(`SYNC_CHECK: ${label} is empty/null`);
                return false;
            }

            // Check for direct array or .data array
            const items = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);

            if (items && items.length > 0) {
                console.warn(`SYNC_CHECK: Found ${items.length} ${label}`);
                return true;
            }

            // Check if it's an object where the first property is an array (some API versions do this)
            const keys = Object.keys(data);
            if (keys.length > 0 && Array.isArray(data[keys[0]]) && data[keys[0]].length > 0) {
                console.warn(`SYNC_CHECK: Found ${data[keys[0]].length} ${label} (nested in ${keys[0]})`);
                return true;
            }

            console.warn(`SYNC_CHECK: No ${label} found`, data);
            return false;
        };

        const fetchCheck = async (endpoint: string, label: string): Promise<string | null> => {
            try {
                const res = await fetch(`${apiUrl}/org/${orgId}/${endpoint}`, { headers });
                if (!res.ok) {
                    console.warn(`SYNC_FETCH: ${label} failed with ${res.status}`);
                    return null;
                }
                const data = await res.json();
                const items = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);

                if (items && items.length > 0) {
                    console.warn(`SYNC_CHECK: Found ${items.length} ${label}`);
                    return items[0].id || items[0]._id || items[0].orgId || "exists"; // Return some ID or fallback
                }

                // Check for nested keys
                const keys = Object.keys(data);
                if (keys.length > 0 && Array.isArray(data[keys[0]]) && data[keys[0]].length > 0) {
                    console.warn(`SYNC_CHECK: Found ${data[keys[0]].length} ${label} (nested)`);
                    return data[keys[0]][0].id || data[keys[0]][0]._id || "exists";
                }

                console.warn(`SYNC_CHECK: No ${label} found`);
                return null;
            } catch (e) {
                console.error(`SYNC_FETCH_ERROR: ${label}`, e);
                return null;
            }
        };

        const locId = await fetchCheck('locations', 'Locations');
        const deptId = await fetchCheck('departments', 'Departments');
        const desigId = await fetchCheck('designations', 'Designations');

        if (locId) setLocationId(locId === "exists" ? "" : locId);
        if (deptId) setDepartmentId(deptId === "exists" ? "" : deptId);

        // Setup is only complete if ALL required steps are done:
        // Organization (orgId exists), Location, Department, and Designation
        // This ensures new users see the tutorial even if org was created during signup
        const isComplete = !!(locId && deptId && desigId);

        console.warn("SYNC_RESULT: Final Assessment ->", {
            hasLocations: !!locId,
            hasDepartments: !!deptId,
            hasDesignations: !!desigId,
            isComplete
        });

        if (isComplete) {
            setCookie('setupCompleted', 'true');
            if (typeof window !== 'undefined') localStorage.setItem('setupCompleted', 'true');
        }

        return isComplete;
    } catch (error) {
        console.error('SYNC_FATAL: Error syncing setup state:', error);
        return false;
    }
};

// Sync employee profile setup state from backend
export const syncEmployeeSetupState = async (token: string, employeeId?: string): Promise<boolean> => {
    if (!employeeId || typeof window === 'undefined') return false;

    try {
        const apiUrl = getApiUrl();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.warn(`SYNC_EMPLOYEE_START: Checking profile setup for Employee: ${employeeId}`);

        const orgId = getOrgId();
        // Fetch employee data using the organizational prefix
        const res = await fetch(`${apiUrl}/org/${orgId}/employees/${employeeId}`, { headers });
        if (!res.ok) {
            console.warn(`SYNC_EMPLOYEE_FETCH: Failed with ${res.status}`);
            return false;
        }

        const data = await res.json();
        const employee = data.data || data.employee || data;

        // Check if onboarding is completed
        const isComplete = employee?.onboardingStatus === 'completed' ||
            (employee?.aadharNumber && employee?.PAN && employee?.bloodGroup);

        console.warn("SYNC_EMPLOYEE_RESULT: Final Assessment ->", {
            onboardingStatus: employee?.onboardingStatus,
            hasIdentityInfo: !!(employee?.aadharNumber && employee?.PAN),
            isComplete
        });

        if (isComplete) {
            setCookie('employeeSetupCompleted', 'true');
            if (typeof window !== 'undefined') localStorage.setItem('employeeSetupCompleted', 'true');
        }

        return isComplete;
    } catch (error) {
        console.error('SYNC_EMPLOYEE_FATAL: Error syncing employee setup state:', error);
        return false;
    }
};

export const getUserDetails = (): {
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
    initials: string;
} => {
    // Try cookies first
    let firstName = getCookie('hrms_user_firstName') || getCookie('registrationFirstName') || '';
    let lastName = getCookie('hrms_user_lastName') || getCookie('registrationLastName') || '';
    let email = getCookie('hrms_user_email') || getCookie('registrationEmail') || '';

    // Fallback to localStorage
    if ((!firstName || firstName === 'undefined') && typeof window !== 'undefined') firstName = localStorage.getItem('hrms_user_firstName') || localStorage.getItem('registrationFirstName') || '';
    if ((!lastName || lastName === 'undefined') && typeof window !== 'undefined') lastName = localStorage.getItem('hrms_user_lastName') || localStorage.getItem('registrationLastName') || '';
    if ((!email || email === 'undefined') && typeof window !== 'undefined') email = localStorage.getItem('hrms_user_email') || localStorage.getItem('registrationEmail') || '';

    let fullName = '';
    const token = getAuthToken();
    let tokenData: any = null;
    if (token) {
        tokenData = decodeToken(token);
    }

    // Clean up "undefined" strings potentially stored in cookies
    if (firstName === 'undefined') firstName = '';
    if (lastName === 'undefined') lastName = '';

    if (firstName || lastName) {
        fullName = `${firstName} ${lastName}`.trim();
    } else if (tokenData) {
        // Try getting name from token structure
        // Some JWTs have 'name', some 'fullName', some 'firstName'/'lastName'
        fullName = tokenData.name ||
            tokenData.fullName ||
            (tokenData.firstName && tokenData.lastName ? `${tokenData.firstName} ${tokenData.lastName}` : '') ||
            'User';

        if ((!email || email === 'undefined') && tokenData.email) email = tokenData.email;
    } else {
        fullName = 'User';
    }

    if (!fullName || fullName === ' ') fullName = 'User';

    // Initials
    const getInitials = (name: string) => {
        if (!name || name === 'User') return 'U';
        const parts = name.trim().split(' ').filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return {
        firstName,
        lastName,
        email,
        fullName,
        initials: getInitials(fullName)
    };
};
