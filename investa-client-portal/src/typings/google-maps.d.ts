declare namespace google {
  namespace maps {
    interface LatLngLiteral { lat: number; lng: number; }
    interface MapOptions { [key: string]: any; }
    interface MarkerOptions { [key: string]: any; }

    namespace places {
      interface PlaceResult { formatted_address?: string; name?: string; geometry?: any; address_components?: any[] }
      class Autocomplete {
        constructor(input: Element | HTMLInputElement, opts?: any);
        addListener(eventName: string, handler: Function): void;
        getPlace(): PlaceResult;
      }
    }
  }
}

declare const google: any;
