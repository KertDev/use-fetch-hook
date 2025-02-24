# useFetch Hook

A custom React hook for fetching data from an API with advanced features including caching, retries, error handling, and timeout support.

## Overview

`useFetch` is designed to simplify API data fetching in React applications by encapsulating complex logic (like caching, retries, advanced error handling, and timeouts) into a single, reusable hook. This is especially valuable in larger applications where multiple components need to fetch data from various endpoints in a consistent and efficient manner.

## Features

- **Caching:**  
  Prevents refetching data by caching API responses keyed by URL.

- **Retries:**  
  Automatically retries failed fetch requests (configurable number of retries) to handle transient network issues.

- **Advanced Error Handling:**  
  Differentiates between server errors, network errors, and aborted requests, providing more meaningful error messages.

- **Timeouts:**  
  Aborts fetch requests that take too long to avoid hanging operations.

- **TypeScript Support:**  
  Uses generics to enforce type safety for the fetched data.

## Getting Started

Since this hook isn’t published on npm, you can integrate it into your project by following one of these methods:

### 1. Cloning the Repository

Clone the repository and copy the `useFetch.ts` file into your project:

```bash
git clone https://github.com/your-username/use-fetch-hook.git
```
Then, copy the useFetch.ts file into your project’s source folder.

2. Direct Copy
Alternatively, you can simply copy the code from the useFetch.ts file directly into your project.

Usage
Below is an example of how to use the useFetch hook in a React component:

```bash
import React from "react";
import useFetch from "./useFetch"; // Adjust the path based on where you placed the file

interface UserData {
  id: number;
  name: string;
  email: string;
}

const UserComponent = () => {
  const { data, error, loading } = useFetch<UserData>("https://api.example.com/user");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>User Info</h1>
      <p>ID: {data?.id}</p>
      <p>Name: {data?.name}</p>
      <p>Email: {data?.email}</p>
    </div>
  );
};

export default UserComponent;
```

Configuration Options
The hook accepts an optional configuration object as its third parameter to customize its behavior:

cache (boolean):
Enable or disable caching. Default is true.

retries (number):
The number of retry attempts for failed requests. Default is 3.

timeout (number):
Timeout duration in milliseconds before aborting the request. Default is 5000 ms.

Example with custom configuration:
```bash
const { data, error, loading } = useFetch<UserData>(
  "https://api.example.com/user",
  {},
  { cache: true, retries: 5, timeout: 7000 }
);
```

Why useFetch?
Creating a custom useFetch hook, instead of using generic fetch calls directly in components, offers several advantages:

Modularity & Reusability:
Encapsulates complex fetch logic in one place, allowing you to reuse the same implementation across your application.

Separation of Concerns:
Keeps your components focused on rendering while the hook handles data fetching, error management, and retries.

Consistency:
Ensures that all components follow the same approach to data fetching, simplifying debugging and maintenance.

License
This project is licensed under the MIT License.
