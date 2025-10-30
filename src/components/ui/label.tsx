import type * as React from "react";

import { cn } from "@/lib/utils";

function Label({
	className,
	children,
	htmlFor,
	...props
}: React.ComponentProps<"label"> & { htmlFor: string }) {
	return (
		<label
			data-slot="label"
			className={cn("inline-flex items-center gap-2 text-sm/4", className)}
			htmlFor={htmlFor}
			{...props}
		>
			{children}
		</label>
	);
}

export { Label };
