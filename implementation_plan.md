# Goal Description
The objective is to implement user authentication for the Gym Management application. This involves:
1. Creating Register and Login pages in the React frontend.
2. Setting up JWT (JSON Web Token) authentication in the Django backend.
3. Securing backend API endpoints so they are only accessible to authenticated users.
4. Protecting frontend routes so that unauthenticated users are redirected to the Login page.

## User Review Required
> [!IMPORTANT]
> The backend changes will require installing `djangorestframework-simplejwt` for JWT token handling.
> Securing the API endpoints means any existing tools/scripts hitting these endpoints without a token will be denied access (401 Unauthorized).

## Proposed Changes

---
### Backend (Django)

#### [MODIFY] [core/settings.py](file:///C:/Users/IRFAN/gym_management/core/settings.py)
- Configure `REST_FRAMEWORK` dictionary to use `rest_framework_simplejwt.authentication.JWTAuthentication` as the default authentication class.
- Set default permissions to `IsAuthenticated` to protect the API globally.

#### [MODIFY] [gym/serializers.py](file:///C:/Users/IRFAN/gym_management/gym/serializers.py)
- Add a `RegisterSerializer` to handle user creation using [CustomUser](file:///c:/Users/IRFAN/gym_management/gym/models.py#9-20).

#### [MODIFY] [gym/views.py](file:///C:/Users/IRFAN/gym_management/gym/views.py)
- Create a `RegisterView` utilizing the `RegisterSerializer`.
- Allow the `RegisterView` to have `AllowAny` permission so new users can register.

#### [MODIFY] [core/urls.py](file:///C:/Users/IRFAN/gym_management/core/urls.py)
- Add URLs for `TokenObtainPairView` (Login) and `TokenRefreshView`.

#### [MODIFY] [gym/urls.py](file:///C:/Users/IRFAN/gym_management/gym/urls.py)
- Add URL for the newly created `RegisterView` (`api/register/`).

---
### Frontend (React)

#### [NEW] [src/context/AuthContext.jsx](file:///C:/Users/IRFAN/frontend/src/context/AuthContext.jsx)
- Create an AuthContext to manage the user's login state, store JWT tokens in `localStorage`, and provide `login`, `register`, and `logout` functions globally.
- Set up an axial interceptor to automatically attach the `Bearer <token>` to all API requests.

#### [NEW] [src/pages/Login.jsx](file:///C:/Users/IRFAN/frontend/src/pages/Login.jsx)
- Create a modern, aesthetic login page where the user can enter their credentials.

#### [NEW] [src/pages/Register.jsx](file:///C:/Users/IRFAN/frontend/src/pages/Register.jsx)
- Create a modern, aesthetic registration page to capture new user details.

#### [MODIFY] [src/App.jsx](file:///C:/Users/IRFAN/frontend/src/App.jsx)
- Wrap the app with `AuthProvider`.
- Introduce a `ProtectedRoute` component to restrict access to the [AuthenticatedLayout](file:///c:/Users/IRFAN/frontend/src/App.jsx#20-53).
- Add public routes for `/login` and `/register`. Redirect root unauthenticated users to `/login`.

#### [MODIFY] [src/components/Sidebar.jsx](file:///C:/Users/IRFAN/frontend/src/components/Sidebar.jsx) & [src/components/Header.jsx](file:///C:/Users/IRFAN/frontend/src/components/Header.jsx)
- Add a "Logout" button that utilizes the AuthContext's logout function.

## Verification Plan

### Automated/Tool Verification
- Verify the backend runs correctly after installing the new pip package and applying settings.
- I will run python tests to perform a registration request, followed by a login request to obtain the tokens.
- Using the extracted token, make an API request to a protected endpoint (like `/api/members/`) to ensure it succeeds.

### Manual Verification
- The user can open their browser, navigate to the React app route, log in or register a new account, and verify that navigating to `/dashboard` works correctly while logging out restricts access.
