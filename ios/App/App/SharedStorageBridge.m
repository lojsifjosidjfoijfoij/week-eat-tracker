#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(SharedStorage, "SharedStorage",
    CAP_PLUGIN_METHOD(set, CAPPluginReturnPromise);
)
