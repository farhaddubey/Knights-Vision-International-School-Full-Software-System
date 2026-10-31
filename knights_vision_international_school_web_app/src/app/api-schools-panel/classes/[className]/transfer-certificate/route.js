// Keep the panel-prefixed legacy route, but delegate to the audited TC request
// workflow rather than issuing a certificate directly.
export { POST } from "@/src/app/api/classes/[className]/transfer-certificate/route";
