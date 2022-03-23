package com.incognito.wallet;

import com.incognito.wallet.generated.BasePackageList;
import android.app.Application;

import java.util.Arrays;

import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.dylanvann.fastimage.FastImageViewPackage;
import io.rumors.reactnativesettings.RNSettingsPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.List;


import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.microsoft.codepush.react.CodePush;

public class MainApplication extends Application implements ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);
  private final ReactNativeHost mReactNativeHost =
          new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
              return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
              @SuppressWarnings("UnnecessaryLocalVariable")
              List<ReactPackage> packages = new PackageList(this).getPackages();
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // packages.add(new RNFirebaseAuthPackage());
              // packages.add(new RNFirebaseDatabasePackage());
              // packages.add(new RNFirebaseMessagingPackage());
              // packages.add(new RNFirebaseNotificationsPackage());
              // packages.add(new RNFirebaseCrashlyticsPackage());
              packages.add(new GomobilePackage());
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // packages.add(new MyReactNativePackage());
              // Add unimodules
              List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
                new ModuleRegistryAdapter(mModuleRegistryProvider)
              );
              packages.addAll(unimodules);
              return packages;
            }

            @Override
            protected String getJSMainModuleName() {
              return "index";
            }

            @Override
            protected String getJSBundleFile() {
              return CodePush.getJSBundleFile();
            }
          };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    long size = 200L * 1024L * 1024L; // 200 MB
    com.facebook.react.modules.storage.ReactDatabaseSupplier.getInstance(getApplicationContext()).setMaximumSize(size);
  }
}
