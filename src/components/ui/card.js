const Card = ({ className, ...props }) => (
  <div
    className={`rounded-lg border bg-white shadow-sm mx-2 my-3 sm:mx-4 sm:my-4 md:max-w-xl md:mx-auto ${className}`}
    {...props}
  />
);

const CardHeader = ({ className, ...props }) => (
  <div className={`flex flex-col space-y-1 p-3 sm:p-4 md:p-6 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }) => (
  <h3
    className={`text-lg sm:text-xl md:text-2xl font-semibold leading-tight tracking-tight ${className}`}
    {...props}
  />
);

const CardContent = ({ className, ...props }) => (
  <div className={`p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0 ${className}`} {...props} />
);

export { Card, CardHeader, CardTitle, CardContent };